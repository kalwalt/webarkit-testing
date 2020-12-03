#include <stdio.h>
#include <emscripten.h>
#include <string>
#include <vector>
#include <unordered_map>
#include <iostream>
#include <WebARKitTrackers/WebARKitOpticalTracking/WebARKitOrbTracker.h>

struct webARKitController {
  int id;
  int videoWidth;
  int videoHeight;
  int videoSize;
  unsigned char *videoFrame;
  int width;
  int height;
  int image2DSize;
  unsigned char *image2DFrame;
};

std::unordered_map<int, webARKitController> webARKitControllers;

static int gwebARKitControllerID = 0;

extern "C" {
  void test() {
    EM_ASM(
      console.log("This is a test from WebARKitJS.cpp!")
    );
  }

  int setup(int videoWidth, int videoHeight) {
 	  int id = gwebARKitControllerID++;
 		webARKitController *warc = &(webARKitControllers[id]);
 		warc->id = id;

    warc->videoWidth = videoWidth;
 		warc->videoHeight = videoHeight;

 		warc->videoSize = videoWidth * videoHeight * 4 * sizeof(unsigned char);
 		warc->videoFrame = (unsigned char*) malloc(warc->videoSize);

 		

    EM_ASM({
      console.log("Allocated videoSize: %d\n", $0);
      console.log("Allocated videoFrame, pointer is: %d\n", $1);
    },
      warc->videoSize,
      warc->videoFrame
    );

 		EM_ASM_({
 			if (!webarkit["frameMalloc"]) {
 				webarkit["frameMalloc"] = ({});
 			}
 			var frameMalloc = webarkit["frameMalloc"];
 			frameMalloc["framevideopointer"] = $1;
 			frameMalloc["framevideosize"] = $2;
 		},
 			warc->id,
      warc->videoSize,
      warc->videoFrame
 		);

 		return warc->id;
 	}

  int imageSetup(int width, int height) {
    int id = gwebARKitControllerID++;
 		webARKitController *warc = &(webARKitControllers[id]);
    warc->width = width;
 		warc->height = height;

 		warc->image2DSize = width * height * 4 * sizeof(unsigned char);
 		warc->image2DFrame = (unsigned char*) malloc(warc->image2DSize);

    EM_ASM({
      console.log("Allocated image2DSize: %d\n", $0);
      console.log("Allocated image2DFrame, pointer is: %d\n", $1);
    },
      warc->image2DSize,
      warc->image2DFrame
    );

    	EM_ASM_({
 			if (!webarkit["frameMalloc"]) {
 				webarkit["frameMalloc"] = ({});
 			}
 			var frameMalloc = webarkit["frameMalloc"];
      frameMalloc["frame2Dpointer"] = $1;
 			frameMalloc["frame2Dsize"] = $2;
 		},
 			warc->id,
 			warc->image2DFrame,
 			warc->image2DSize
 		);
    return warc->id;
  }

  


    int initTracking(int id, size_t refCols, size_t refRows) {
      if (webARKitControllers.find(id) == webARKitControllers.end()) { return 0; }
      webARKitController *warc = &(webARKitControllers[id]);
      WebARKitOrbTracker tracker;
      unsigned char *data;
      data = warc->image2DFrame;

      EM_ASM(
        console.log('Start to initialize tracker...');
      );
      tracker.initialize(data, refCols, refRows);
      return 0;
    }

    int track(int id, size_t refCols, size_t refRows) {
      if (webARKitControllers.find(id) == webARKitControllers.end()) { return 0; }
      webARKitController *warc = &(webARKitControllers[id]);
      WebARKitOrbTracker tracker;
      unsigned char *data;
      data = warc->videoFrame;

      EM_ASM(
        console.log('Start to initialize tracking...');
      );
      tracker.track(data, refCols, refRows);
      return 0;
    }


}

#include "bindings.cpp"
