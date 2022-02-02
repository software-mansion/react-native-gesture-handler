"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PinchGesture = void 0;

var _gesture = require("./gesture");

function changeEventCalculator(current, previous) {
  'worklet';

  let changePayload;

  if (previous === undefined) {
    changePayload = {
      scaleChange: current.scale
    };
  } else {
    changePayload = {
      scaleChange: current.scale / previous.scale
    };
  }

  return { ...current,
    ...changePayload
  };
}

class PinchGesture extends _gesture.ContinousBaseGesture {
  constructor() {
    super();
    this.handlerName = 'PinchGestureHandler';
  }

  onChange(callback) {
    // @ts-ignore TS being overprotective, PinchGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }

}

exports.PinchGesture = PinchGesture;
//# sourceMappingURL=pinchGesture.js.map