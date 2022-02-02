"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RotationGesture = void 0;

var _gesture = require("./gesture");

function changeEventCalculator(current, previous) {
  'worklet';

  let changePayload;

  if (previous === undefined) {
    changePayload = {
      rotationChange: current.rotation
    };
  } else {
    changePayload = {
      rotationChange: current.rotation - previous.rotation
    };
  }

  return { ...current,
    ...changePayload
  };
}

class RotationGesture extends _gesture.ContinousBaseGesture {
  constructor() {
    super();
    this.handlerName = 'RotationGestureHandler';
  }

  onChange(callback) {
    // @ts-ignore TS being overprotective, RotationGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }

}

exports.RotationGesture = RotationGesture;
//# sourceMappingURL=rotationGesture.js.map