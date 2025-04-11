import { BaseGestureConfig, ContinousBaseGesture } from './gesture';
import { ForceTouchGestureConfig } from '../ForceTouchGestureHandler';
import type { ForceTouchGestureHandlerEventPayload } from '../GestureHandlerEventPayload';
import { GestureUpdateEvent } from '../gestureHandlerCommon';

export type ForceTouchGestureChangeEventPayload = {
  forceChange: number;
};

function changeEventCalculator(
  current: GestureUpdateEvent<ForceTouchGestureHandlerEventPayload>,
  previous?: GestureUpdateEvent<ForceTouchGestureHandlerEventPayload>
) {
  'worklet';
  let changePayload: ForceTouchGestureChangeEventPayload;
  if (previous === undefined) {
    changePayload = {
      forceChange: current.force,
    };
  } else {
    changePayload = {
      forceChange: current.force - previous.force,
    };
  }

  return { ...current, ...changePayload };
}

export class ForceTouchGesture extends ContinousBaseGesture<
  ForceTouchGestureHandlerEventPayload,
  ForceTouchGestureChangeEventPayload
> {
  public config: BaseGestureConfig & ForceTouchGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'ForceTouchGestureHandler';
  }

  /**
   * A minimal pressure that is required before gesture can activate.
   * Should be a value from range [0.0, 1.0]. Default is 0.2.
   * @param force
   */
  minForce(force: number) {
    this.config.minForce = force;
    return this;
  }

  /**
   * A maximal pressure that could be applied for gesture.
   * If the pressure is greater, gesture fails. Should be a value from range [0.0, 1.0].
   * @param force
   */
  maxForce(force: number) {
    this.config.maxForce = force;
    return this;
  }

  /**
   * Value defining if haptic feedback has to be performed on activation.
   * @param value
   */
  feedbackOnActivation(value: boolean) {
    this.config.feedbackOnActivation = value;
    return this;
  }

  onChange(
    callback: (
      event: GestureUpdateEvent<
        GestureUpdateEvent<
          ForceTouchGestureHandlerEventPayload &
            ForceTouchGestureChangeEventPayload
        >
      >
    ) => void
  ) {
    // @ts-ignore TS being overprotective, ForceTouchGestureHandlerEventPayload is Record
    this.handlers.changeEventCalculator = changeEventCalculator;
    return super.onChange(callback);
  }
}

export type ForceTouchGestureType = InstanceType<typeof ForceTouchGesture>;
