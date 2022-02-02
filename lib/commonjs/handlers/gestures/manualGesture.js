"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ManualGesture = void 0;

var _gesture = require("./gesture");

function changeEventCalculator(current, _previous) {
  'worklet';

  return current;
}

class ManualGesture extends _gesture.ContinousBaseGesture {
  constructor() {
    super();
    this.handlerName = 'ManualGestureHandler';
  }

  onChange(callback) {
    // @ts-ignore TS being overprotective, Record<string, never> is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }

}

exports.ManualGesture = ManualGesture;
//# sourceMappingURL=manualGesture.js.map