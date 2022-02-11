// #pragma once

// #include <react/renderer/graphics/Float.h>
// #include <react/renderer/graphics/Geometry.h>
// #include <react/renderer/graphics/conversions.h>

// #ifdef ANDROID
// #include <folly/dynamic.h>
// #include <react/renderer/mapbuffer/MapBuffer.h>
// #include <react/renderer/mapbuffer/MapBufferBuilder.h>
// #endif

// namespace facebook {
// namespace react {

// class RNGestureHandlerButtonState final {
// public:
//  using Shared = std::shared_ptr<const RNGestureHandlerButtonState>;

//  RNGestureHandlerButtonState(){};
//  RNGestureHandlerButtonState(Size frameSize_) : frameSize(frameSize_){};

// #ifdef ANDROID
//  RNGestureHandlerButtonState(
//      RNGestureHandlerButtonState const &previousState,
//      folly::dynamic data)
//      : frameSize(Size{
//            (Float)data["frameWidth"].getDouble(),
//            (Float)data["frameHeight"].getDouble()}){};
// #endif

//  const Size frameSize{};

// #ifdef ANDROID
//  folly::dynamic getDynamic() const;
//  MapBuffer getMapBuffer() const {
//    return MapBufferBuilder::EMPTY();
//  };

// #endif

// #pragma mark - Getters
// };

// } // namespace react
// } // namespace facebook
