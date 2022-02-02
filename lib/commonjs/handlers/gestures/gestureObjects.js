"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GestureObjects = void 0;

var _flingGesture = require("./flingGesture");

var _forceTouchGesture = require("./forceTouchGesture");

var _gestureComposition = require("./gestureComposition");

var _longPressGesture = require("./longPressGesture");

var _panGesture = require("./panGesture");

var _pinchGesture = require("./pinchGesture");

var _rotationGesture = require("./rotationGesture");

var _tapGesture = require("./tapGesture");

var _nativeGesture = require("./nativeGesture");

var _manualGesture = require("./manualGesture");

const GestureObjects = {
  Tap: () => {
    return new _tapGesture.TapGesture();
  },
  Pan: () => {
    return new _panGesture.PanGesture();
  },
  Pinch: () => {
    return new _pinchGesture.PinchGesture();
  },
  Rotation: () => {
    return new _rotationGesture.RotationGesture();
  },
  Fling: () => {
    return new _flingGesture.FlingGesture();
  },
  LongPress: () => {
    return new _longPressGesture.LongPressGesture();
  },
  ForceTouch: () => {
    return new _forceTouchGesture.ForceTouchGesture();
  },
  Native: () => {
    return new _nativeGesture.NativeGesture();
  },
  Manual: () => {
    return new _manualGesture.ManualGesture();
  },

  /**
   * Builds a composed gesture consisting of gestures provided as parameters.
   * The first one that becomes active cancels the rest of gestures.
   */
  Race: (...gestures) => {
    return new _gestureComposition.ComposedGesture(...gestures);
  },

  /**
   * Builds a composed gesture that allows all base gestures to run simultaneously.
   */
  Simultaneous(...gestures) {
    return new _gestureComposition.SimultaneousGesture(...gestures);
  },

  /**
   * Builds a composed gesture where only one of the provided gestures can become active.
   * Priority is decided through the order of gestures: the first one has higher priority
   * than the second one, second one has higher priority than the third one, and so on.
   * For example, to make a gesture that recognizes both single and double tap you need
   * to call Exclusive(doubleTap, singleTap).
   */
  Exclusive(...gestures) {
    return new _gestureComposition.ExclusiveGesture(...gestures);
  }

};
exports.GestureObjects = GestureObjects;
//# sourceMappingURL=gestureObjects.js.map