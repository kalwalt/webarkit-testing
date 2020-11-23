#include <stdio.h>
#include <iostream>
#include <emscripten.h>
#include <WebARKitTrackers/WebARKitOpticalTracking/WebARKitOrbTracker.h>

extern "C" {
   void test() {
     EM_ASM(
       console.log("This is a test from WebARKitJS.cpp!")
     );
   }
   int initTracking(uchar refData[], size_t refCols, size_t refRows) {
     WebARKitOrbTracker *tracker;
     tracker->initialize(refData*, refCols, refRows);
     return 0;
   }
}

#include "bindings.cpp"
