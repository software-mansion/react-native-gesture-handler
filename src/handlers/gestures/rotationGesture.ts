import { ContinousBaseGesture, BaseGestureConfig } from './gesture';
import type { RotationGestureHandlerEventPayload } from '../GestureHandlerEventPayload';
import { GestureUpdateEvent } from '../gestureHandlerCommon';
import type { RotationGestureConfig } from '../RotationGestureHandler';

type RotationGestureChangeEventPayload = {
  rotationChange: number;
};

function changeEventCalculator(
  current: GestureUpdateEvent<RotationGestureHandlerEventPayload>,
  previous?: GestureUpdateEvent<RotationGestureHandlerEventPayload>
) {
  'worklet';
  let changePayload: RotationGestureChangeEventPayload;
  if (previous === undefined) {
    changePayload = {
      rotationChange: current.rotation,
    };
  } else {
    changePayload = {
      rotationChange: current.rotation - previous.rotation,
    };
  }

  return { ...current, ...changePayload };
}

export class RotationGesture extends ContinousBaseGesture<
  RotationGestureHandlerEventPayload,
  RotationGestureChangeEventPayload
> {
  public config: BaseGestureConfig & RotationGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'RotationGestureHandler';
  }

  /**
   * @Platform Android
   * When `false`, the Handler will not finish when second Pointer Lifts,
   * allowing Gesture to continue when a new second Pointer arrives
   * (on iOS it's the default Behaviour)
   *
   * @param {boolean} value
   */
  secondPointerLiftFinishesGesture(value: boolean) {
    this.config.secondPointerLiftFinishesGesture = value;
    return this;
  }

  onChange(
    callback: (
      event: GestureUpdateEvent<
        RotationGestureHandlerEventPayload & RotationGestureChangeEventPayload
      >
    ) => void
  ) {
    // @ts-ignore TS being overprotective, RotationGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }
}

export type RotationGestureType = InstanceType<typeof RotationGesture>;
