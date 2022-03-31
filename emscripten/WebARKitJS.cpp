#include <AR/ar.h>
#include <AR2/config.h>
#include <AR2/imageFormat.h>
#include <AR2/util.h>
#include <WebARKitTrackers/WebARKitOpticalTracking/WebARKitOrbTracker.h>
#include <emscripten.h>
#include <iostream>
#include <opencv2/core.hpp>
#include <opencv2/core/types_c.h>
#include <opencv2/opencv.hpp>
#include <stdio.h>
#include <string>
#include <sys/types.h>
#include <unordered_map>
#include <vector>

// using namespace emscripten;

struct webARKitController {
  int id;
  int videoWidth;
  int videoHeight;
  int videoSize;
  unsigned char *videoFrame;
  unsigned char *videoLuma;
  int width;
  int height;
  char output_t_valid;
  double *output_t_data;
};

std::unordered_map<int, webARKitController> webARKitControllers;

static int gwebARKitControllerID = 0;

extern "C" {

int setup(int videoWidth, int videoHeight) {
  int id = gwebARKitControllerID++;
  webARKitController *warc = &(webARKitControllers[id]);
  warc->id = id;

  warc->videoWidth = videoWidth;
  warc->videoHeight = videoHeight;

  warc->videoSize = videoWidth * videoHeight * 4 * sizeof(unsigned char);
  warc->videoFrame = (unsigned char *)malloc(warc->videoSize);
  warc->videoLuma = (unsigned char *)malloc(warc->videoSize / 4);
  warc->output_t_data = (double *)malloc(17 * sizeof(double));

  EM_ASM(
      {
        console.log("Allocated videoSize: %d\n", $0);
        console.log("Allocated videoFrame, pointer is: %d\n", $1);
      },
      warc->videoSize, warc->videoFrame);

  EM_ASM_(
      {
        if (!webarkit["frameMalloc"]) {
          webarkit["frameMalloc"] = ({});
        }
        var frameMalloc = webarkit["frameMalloc"];
        frameMalloc["framevideopointer"] = $1;
        frameMalloc["framevideosize"] = $2;
        frameMalloc["videoLumaPointer"] = $3;
      },
      warc->id, warc->videoFrame, warc->videoSize, warc->videoLuma);

  return warc->id;
}

int initTracking(int id, const char *filename) {
  if (webARKitControllers.find(id) == webARKitControllers.end()) {
    return 0;
  }
  webARKitController *warc = &(webARKitControllers[id]);

  EM_ASM(console.log('Start WebARKitOrbTracker tracker...'););

  char *ext;
  char buf1[512], buf2[512];
  size_t refCols;
  size_t refRows;

  AR2JpegImageT *jpegImage;
  if (!filename) {
    return 0;
  }
  ext = arUtilGetFileExtensionFromPath(filename, 1);
  EM_ASM(
      {
        var message = UTF8ToString($0);
        console.log("ext: ", message)
      },
      ext);
  if (!ext) {
    ARLOGe("Error: unable to determine extension of file '%s'. Exiting.\n",
           filename);
    return -1;
  }
  if (strcmp(ext, "jpeg") == 0 || strcmp(ext, "jpg") == 0 ||
      strcmp(ext, "jpe") == 0) {
    ARLOGi("Reading JPEG file...\n");
    ar2UtilDivideExt(filename, buf1, buf2);
    jpegImage = ar2ReadJpegImage(buf1, buf2);
    if (jpegImage == NULL) {
      ARLOGe("Error: unable to read JPEG image from file '%s'. Exiting.\n",
             filename);
      return -1;
    }
    ARLOGi("   Done.\n");

    refCols = jpegImage->xsize;
    refRows = jpegImage->ysize;

    EM_ASM(console.log('Start to initialize tracker...'););

    initAR((unsigned char *)jpegImage->image, refCols, refRows);
    free(jpegImage);
    free(ext);
  }
  return 0;
}

int readJpeg(int id, std::string filename) {
  ARLOGi("Filename is: '%s'\n", filename.c_str());
  initTracking(id, filename.c_str());
  return 0;
}

int resetTrackingAR(int id, size_t refCols, size_t refRows) {
  if (webARKitControllers.find(id) == webARKitControllers.end()) {
    return 0;
  }
  webARKitController *warc = &(webARKitControllers[id]);

  EM_ASM(console.log('Reset tracking...'););

  output_t *out = resetTracking(warc->videoFrame, refCols, refRows);
  // std::cout << out->valid << std::endl;
  warc->output_t_valid = out->valid;
  warc->output_t_data = out->data;

  EM_ASM({ console.log("Output from tracker: %d\n", $0); }, out);
  EM_ASM({ console.log("Output from valid: %i\n", $0); }, warc->output_t_valid);
  EM_ASM_(
      {
        if (!webarkit["frameMalloc"]) {
          webarkit["frameMalloc"] = ({});
        }
        var frameMalloc = webarkit["frameMalloc"];
        frameMalloc["outputtValid"] = $1;
        frameMalloc["outputtData"] = $2;
      },
      warc->id, warc->output_t_valid, warc->output_t_data);
  EM_ASM(console.log('Reset done.'););
  return 0;
}

int trackAR(int id, size_t refCols, size_t refRows) {
  if (webARKitControllers.find(id) == webARKitControllers.end()) {
    return 0;
  }
  webARKitController *warc = &(webARKitControllers[id]);

  EM_ASM(console.log('Start to initialize tracking...'););
  output_t *out = track(warc->videoFrame, refCols, refRows);
  EM_ASM({ console.log("Output from tracker: %d\n", $0); }, out);
  EM_ASM({ console.log("Output from valid: %i\n", $0); }, warc->output_t_valid);
  EM_ASM_(
      {
        if (!webarkit["frameMalloc"]) {
          webarkit["frameMalloc"] = ({});
        }
        var frameMalloc = webarkit["frameMalloc"];
        frameMalloc["outputtValid"] = $1;
        frameMalloc["outputtData"] = $2;
      },
      warc->id, warc->output_t_valid, warc->output_t_data);

  return 0;
}
}

#include "bindings.cpp"