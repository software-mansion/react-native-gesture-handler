"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlingGesture = void 0;

var _gesture = require("./gesture");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class FlingGesture extends _gesture.BaseGesture {
  constructor() {
    super();

    _defineProperty(this, "config", {});

    this.handlerName = 'FlingGestureHandler';
  }

  numberOfPointers(pointers) {
    this.config.numberOfPointers = pointers;
    return this;
  }

  direction(direction) {
    this.config.direction = direction;
    return this;
  }

}

exports.FlingGesture = FlingGesture;
//# sourceMappingURL=flingGesture.js.map