import { UnwrappedGestureHandlerEvent } from '../gestureHandlerCommon';
import { BaseGesture, BaseGestureConfig, CALLBACK_TYPE } from './gesture';
import {
  ForceTouchGestureConfig,
  ForceTouchGestureHandlerEventPayload,
} from '../ForceTouchGestureHandler';

export class ForceTouchGesture extends BaseGesture<ForceTouchGestureHandlerEventPayload> {
  public config: BaseGestureConfig & ForceTouchGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'ForceTouchGestureHandler';
  }

  setOnUpdate(
    callback: (
      event: UnwrappedGestureHandlerEvent<ForceTouchGestureHandlerEventPayload>
    ) => void
  ) {
    this.handlers.onUpdate = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.UPDATE] =
      //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
      callback.__workletHash != null;
    return this;
  }

  setMinForce(force: number) {
    this.config.minForce = force;
    return this;
  }

  setMaxForce(force: number) {
    this.config.maxForce = force;
    return this;
  }

  setFeedbackOnActivation(value: boolean) {
    this.config.feedbackOnActivation = value;
    return this;
  }
}
