importScripts("../dist/WebARKit.js");

var ar;
var next = null;
var markerResult = null;

self.onmessage = (e) => {
  var msg = e.data;
  switch (msg.type) {
    case "initTracker": {
      initTracker(msg);
      return;
    }
    case "process": {
      next = msg.data;
      processFrame();
      return;
    }
  }
};

function initTracker(msg) {
  var trackerType = msg.trackerType;

  var onLoad = function (wark) {
    ar = wark;
    wark.loadTrackerGrayImage(msg.imageData, msg.imgWidth, msg.imgHeight);

    postMessage({ type: "loadedTracker"})

    wark.addEventListener("getMarker", function (event) {
      console.log(event.data.corners);
      markerResult = {
        type: "found",
        corners: JSON.stringify(event.data.corners),
        matrix: JSON.stringify(event.data.matrix),
      };
    });
  };

  var onError = function (error) {
    console.error(error);
  };

  WebARKit.WebARKitController.init_raw(msg.videoWidth, msg.videoHeight, trackerType)
    .then(onLoad)
    .catch(onError);
}

function processFrame() {
  markerResult = null;
  if (ar && ar.process_raw) {
    ar.process_raw(next);
  }
  if (markerResult) {
    postMessage(markerResult);
  } else {
    postMessage({
      type: "not found",
    });
  }

  next = null;
}
