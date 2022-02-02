import { ContinousBaseGesture } from './gesture';

function changeEventCalculator(current, _previous) {
  'worklet';

  return current;
}

export class ManualGesture extends ContinousBaseGesture {
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
//# sourceMappingURL=manualGesture.js.map