#include "WebARKitJS.h"

void WebARKit::initTrackerGray(emscripten::val data_buffer, int width, int height) {
    auto u8 = emscripten::convertJSArrayToNumberVector<uint8_t>(data_buffer);
    manager.initTracker(u8.data(), width, height);
}

void WebARKit::processFrame(emscripten::val data_buffer, webarkit::ColorSpace colorSpace) {
    auto u8 = emscripten::convertJSArrayToNumberVector<uint8_t>(data_buffer);
    manager.processFrameData(u8.data(), this->videoWidth, this->videoHeight, colorSpace);
}

void WebARKit::setLogLevel(int logLevel) { manager.setLogLevel(logLevel); }

emscripten::val WebARKit::getHomography() {
    std::vector<double> output;
    output = manager.getOutputData();
    emscripten::val homography = emscripten::val::array();
    for (auto i = 0; i < 9; i++) {
        homography.call<void>("push", output[i]);
    }
    return homography;
}

emscripten::val WebARKit::getPoseMatrix() {
    cv::Mat poseMatrix = manager.getPoseMatrix();
    emscripten::val pose = emscripten::val::array();
    for (auto i = 0; i < poseMatrix.rows; i++) {
        for (auto j = 0; j < poseMatrix.cols; j++) {
            pose.call<void>("push", poseMatrix.at<double>(i, j));
        }
    }
    return pose;
}

emscripten::val WebARKit::getCameraProjectionMatrix() {
    std::array<double, 16> cameraProjectionMatrix = manager.getCameraProjectionMatrix();
    emscripten::val cameraProjection = emscripten::val::array();
    for (auto c: cameraProjectionMatrix) {
        cameraProjection.call<void>("push", c);
    }
    return cameraProjection;
}

emscripten::val WebARKit::getCorners() {
    std::vector<double> output;
    output = manager.getOutputData();
    emscripten::val corners = emscripten::val::array();
    for (auto i = 9; i < 17; i++) {
        corners.call<void>("push", output[i]);
    }
    return corners;
}

bool WebARKit::isValid() { return manager.isValid(); }

#include "bindings.cpp"