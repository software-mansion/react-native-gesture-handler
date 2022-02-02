"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LongPressGesture = void 0;

var _gesture = require("./gesture");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class LongPressGesture extends _gesture.BaseGesture {
  constructor() {
    super();

    _defineProperty(this, "config", {});

    this.handlerName = 'LongPressGestureHandler';
  }

  minDuration(duration) {
    this.config.minDurationMs = duration;
    return this;
  }

  maxDistance(distance) {
    this.config.maxDist = distance;
    return this;
  }

}

exports.LongPressGesture = LongPressGesture;
//# sourceMappingURL=longPressGesture.js.map