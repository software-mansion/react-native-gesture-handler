import { ContinousBaseGesture } from './gesture';

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

export class PinchGesture extends ContinousBaseGesture {
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
//# sourceMappingURL=pinchGesture.js.map