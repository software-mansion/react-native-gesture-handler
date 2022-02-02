import { ContinousBaseGesture } from './gesture';

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

export class RotationGesture extends ContinousBaseGesture {
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
//# sourceMappingURL=rotationGesture.js.map