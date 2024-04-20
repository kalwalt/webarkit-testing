/*
 * Simple script for running emcc on ARToolKit
 * @author zz85 github.com/zz85
 * @author ThorstenBux github.com/ThorstenBux
 * @author kalwalt github.com/kalwalt
 */


var
    exec = require('child_process').exec,
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    child;

const platform = os.platform();

var NO_LIBAR = false;
var WITH_FILTERING = 1;

var DEBUG = false;

var arguments = process.argv;

for (var j = 2; j < arguments.length; j++) {
    if (arguments[j] == '--no-libar') {
        NO_LIBAR = true;
        console.log('Building webarkit with --no-libar option, libwebarkit will be preserved.');
    };
    if (arguments[j] == '--debug') {
        console.log('Building webarkit with --debug option.');
        DEBUG = true;
    }
}

var HAVE_NFT = 1;

var EMSCRIPTEN_ROOT = process.env.EMSCRIPTEN;
var WEBARKITLIB_ROOT = process.env.WEBARKITLIB_ROOT || path.resolve(__dirname, "../emscripten/WebARKitLib");

if (!EMSCRIPTEN_ROOT) {
    console.log("\nWarning: EMSCRIPTEN environment variable not found.")
    console.log("If you get a \"command not found\" error,\ndo `source <path to emsdk>/emsdk_env.sh` and try again.");
}

var EMCC = EMSCRIPTEN_ROOT ? path.resolve(EMSCRIPTEN_ROOT, 'emcc') : 'emcc';
var EMPP = EMSCRIPTEN_ROOT ? path.resolve(EMSCRIPTEN_ROOT, 'em++') : 'em++';

var OPTIMIZE_FLAGS;
if (DEBUG) {
    OPTIMIZE_FLAGS = ' -O1 ';
} else {
    OPTIMIZE_FLAGS = ' -Oz '; // -Oz for smallest size
}

var MEM = 128 * 1024 * 1024; // 64MB


var SOURCE_PATH = path.resolve(__dirname, '../emscripten/') + '/';
var OUTPUT_PATH = path.resolve(__dirname, '../build/') + '/';

var BUILD_WASM_ES6_FILE = 'webarkit_ES6_wasm.js';
var BUILD_WASM_SIMD_ES6_FILE = 'webarkit_ES6_wasm.simd.js';

var MAIN_SOURCES = [
    'WebARKitJS.cpp'
];

if (!fs.existsSync(path.resolve(WEBARKITLIB_ROOT, 'include/AR/config.h'))) {
    console.log("Renaming and moving config.h.in to config.h");
    fs.copyFileSync(
        path.resolve(WEBARKITLIB_ROOT, 'include/AR/config.h.in'),
        path.resolve(WEBARKITLIB_ROOT, 'include/AR/config.h')
    );
    console.log("Done!");
}

MAIN_SOURCES = MAIN_SOURCES.map(function (src) {
    return path.resolve(SOURCE_PATH, src);
}).join(' ');

let ar_sources;

if (platform === 'win32') {
    var glob = require("glob");
    function match(pattern) {
        var r = glob.sync('emscripten/WebARKitLib/lib/SRC/' + pattern);
        return r;
    }
    function matchAll(patterns, prefix = "") {
        let r = [];
        for (let pattern of patterns) {
            r.push(...(match(prefix + pattern)));
        }
        return r;
    }

    ar_sources = matchAll([
        'AR/arLabelingSub/*.c',
        'AR/*.c',
        'ARICP/*.c',
        'ARUtil/log.c',
        'ARUtil/file_utils.c',
    ]);
} else {
    ar_sources = [
        'AR/arLabelingSub/*.c',
        'AR/*.c',
        'ARICP/*.c',
        'ARUtil/log.c',
        'ARUtil/file_utils.c',
    ].map(function (src) {
        return path.resolve(__dirname, WEBARKITLIB_ROOT + '/lib/SRC/', src);
    });
}

var ar2_sources = [
    'handle.c',
    'imageSet.c',
    'jpeg.c',
    'marker.c',
    'featureMap.c',
    'featureSet.c',
    'selectTemplate.c',
    'surface.c',
    'tracking.c',
    'tracking2d.c',
    'matching.c',
    'matching2.c',
    'template.c',
    'searchPoint.c',
    'coord.c',
    'util.c',
].map(function (src) {
    return path.resolve(__dirname, WEBARKITLIB_ROOT + '/lib/SRC/AR2/', src);
});

var webarkit_sources = [
    '../WebARKitCamera.cpp',
    '../WebARKitLog.cpp',
    '../WebARKitGL.cpp',
    '../WebARKitManager.cpp',
    '../WebARKitPattern.cpp',
    'WebARKitOpticalTracking/WebARKitTracker.cpp',
    'WebARKitOpticalTracking/WebARKitConfig.cpp'
].map(function (src) {
    return path.resolve(__dirname, WEBARKITLIB_ROOT + '/WebARKit/WebARKitTrackers/', src);
});

if (HAVE_NFT) {
    ar_sources = ar_sources
        .concat(webarkit_sources);
}

var DEFINES = ' ';
if (HAVE_NFT) DEFINES += ' -D HAVE_NFT ';
if (WITH_FILTERING) DEFINES += ' -D WITH_FILTERING ';

var FLAGS = '' + OPTIMIZE_FLAGS;
FLAGS += ' -Wno-warn-absolute-paths ';
FLAGS += ' -s TOTAL_MEMORY=' + MEM + ' ';
FLAGS += ' -s USE_ZLIB=1';
FLAGS += ' -s USE_LIBJPEG';
FLAGS += ' --memory-init-file 0 '; // for memless file
FLAGS += ' -s "EXPORTED_RUNTIME_METHODS=[\'FS\']"';
FLAGS += ' -s ALLOW_MEMORY_GROWTH=1';
FLAGS += ' --profiling '

var WASM_FLAGS = ' -s SINGLE_FILE=1 '
var SIMD = ' -msimd128 '
var ES6_FLAGS = ' -s EXPORT_ES6=1 -s USE_ES6_IMPORT_META=0 -s MODULARIZE=1 ';

FLAGS += ' --bind ';

/* DEBUG FLAGS */
var DEBUG_FLAGS = ' ';

if (DEBUG) {
    // Choose your Debug options
    DEBUG_FLAGS += ' -gsource-map -fsanitize=undefined ';
    DEBUG_FLAGS += ' -s ASSERTIONS=2 '
    //DEBUG_FLAGS += ' --profiling '
    DEBUG_FLAGS += '  -s DEMANGLE_SUPPORT=1 ';
    // WEBARKIT_DEBUG define flag is used to display additional debug information in the console
    DEBUG_FLAGS += ' -DWEBARKIT_DEBUG '
}

var INCLUDES = [
    path.resolve(__dirname, WEBARKITLIB_ROOT + "/include"),
    path.resolve(__dirname, WEBARKITLIB_ROOT + "/WebARKit/include"),
    path.resolve(__dirname, WEBARKITLIB_ROOT + "/WebARKit/WebARKitTrackers/WebARKitOpticalTracking/include"),
    path.resolve(__dirname, "../opencv/include"),
    path.resolve(__dirname, "../opencv_js"),
    path.resolve(__dirname, "../opencv/modules/calib3d/include"),
    path.resolve(__dirname, "../opencv/modules/core/include"),
    path.resolve(__dirname, "../opencv/modules/features2d/include"),
    path.resolve(__dirname, "../opencv/modules/flann/include"),
    path.resolve(__dirname, "../opencv/modules/imgproc/include"),
    path.resolve(__dirname, "../opencv/modules/imgcodecs/include"),
    path.resolve(__dirname, "../opencv/modules/video/include"),
    path.resolve(__dirname, "../opencv_contrib/modules/xfeatures2d/include"),
    OUTPUT_PATH,
    SOURCE_PATH,
]
    .map(function (s) {
        return "-I" + s;
    })
    .join(" ");

var OPENCV_LIBS = [
    path.resolve(__dirname, '../opencv_js/lib/libopencv_calib3d.a'),
    path.resolve(__dirname, '../opencv_js/lib/libopencv_core.a'),
    path.resolve(__dirname, '../opencv_js/lib/libopencv_features2d.a'),
    path.resolve(__dirname, '../opencv_js/lib/libopencv_flann.a'),
    path.resolve(__dirname, '../opencv_js/lib/libopencv_imgproc.a'),
    path.resolve(__dirname, '../opencv_js/lib/libopencv_video.a'),
    path.resolve(__dirname, '../opencv_js/lib/libopencv_xfeatures2d.a'),
].map(function (s) { return ' ' + s }).join(' ');

function format(str) {
    for (var f = 1; f < arguments.length; f++) {
        str = str.replace(/{\w*}/, arguments[f]);
    }
    return str;
}

function clean_builds() {
    try {
        var stats = fs.statSync(OUTPUT_PATH);
    } catch (e) {
        fs.mkdirSync(OUTPUT_PATH);
    }

    try {
        var files = fs.readdirSync(OUTPUT_PATH);
        var i;
        var filesLength = files.length;
        if (filesLength > 0)
            if (NO_LIBAR == true) {
                i = 1;
            } else { i = 0; }
        for (; i < filesLength; i++) {
            var filePath = OUTPUT_PATH + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
        }
    }
    catch (e) { return console.log(e); }
}

var compile_arlib = format(EMCC + ' ' + INCLUDES + ' '
    //+ ar_sources.join(' ')
    + webarkit_sources.join(' ')
    + FLAGS + ' ' + DEBUG_FLAGS + ' ' + DEFINES + ' -r -o {OUTPUT_PATH}libwebarkit.bc ',
    OUTPUT_PATH);

var compile_simd_arlib = format(EMCC + ' ' + INCLUDES + ' '
    //+ ar_sources.join(' ')
    + webarkit_sources.join(' ')
    + FLAGS + ' ' + DEBUG_FLAGS + ' ' + DEFINES +  SIMD + ' -r -o {OUTPUT_PATH}libwebarkit.simd.bc ',
    OUTPUT_PATH);

var BC = " {OUTPUT_PATH}libwebarkit.bc ";

var BC_SIMD = " {OUTPUT_PATH}libwebarkit.simd.bc ";

var compile_wasm_es6 = format(EMCC + ' ' + INCLUDES + ' '
    + BC + MAIN_SOURCES
    + FLAGS + WASM_FLAGS + DEFINES + ES6_FLAGS + DEBUG_FLAGS + OPENCV_LIBS + ' -o {OUTPUT_PATH}{BUILD_FILE} ',
    OUTPUT_PATH, OUTPUT_PATH, BUILD_WASM_ES6_FILE);

var compile_wasm_simd_es6 = format(EMCC + ' ' + INCLUDES + ' '
    + BC_SIMD + MAIN_SOURCES
    + FLAGS + WASM_FLAGS + SIMD + DEFINES + ES6_FLAGS + DEBUG_FLAGS + OPENCV_LIBS + ' -o {OUTPUT_PATH}{BUILD_FILE} ',
    OUTPUT_PATH, OUTPUT_PATH, BUILD_WASM_SIMD_ES6_FILE);

/*
 * Run commands
 */

function onExec(error, stdout, stderr) {
    if (stdout) console.log('stdout: ' + stdout);
    if (stderr) console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error.code);
        process.exit(error.code);
    } else {
        runJob();
    }
}

function runJob() {
    if (!jobs.length) {
        console.log('Jobs completed');
        return;
    }
    var cmd = jobs.shift();

    if (typeof cmd === 'function') {
        cmd();
        runJob();
        return;
    }

    console.log('\nRunning command: ' + cmd + '\n');
    exec(cmd, onExec);
}

var jobs = [];

function addJob(job) {
    jobs.push(job);
}

addJob(clean_builds);
addJob(compile_arlib);
addJob(compile_simd_arlib);
addJob(compile_wasm_es6)
addJob(compile_wasm_simd_es6)

if (NO_LIBAR == true) {
    jobs.splice(1, 1);
}

runJob();
