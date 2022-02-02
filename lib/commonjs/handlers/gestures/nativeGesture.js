"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NativeGesture = void 0;

var _gesture = require("./gesture");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class NativeGesture extends _gesture.BaseGesture {
  constructor() {
    super();

    _defineProperty(this, "config", {});

    this.handlerName = 'NativeViewGestureHandler';
  }

  shouldActivateOnStart(value) {
    this.config.shouldActivateOnStart = value;
    return this;
  }

  disallowInterruption(value) {
    this.config.disallowInterruption = value;
    return this;
  }

}

exports.NativeGesture = NativeGesture;
//# sourceMappingURL=nativeGesture.js.map