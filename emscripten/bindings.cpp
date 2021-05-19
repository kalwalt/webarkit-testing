#include <emscripten/bind.h>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(constant_bindings) {
    function("test", &test);
    function("setup", &setup);
    function("imageSetup", &imageSetup);
    function("initTracking", &initTracking);
    function("resetTracking", &resetTracking);
    function("track", &track);
}
