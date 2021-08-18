import { UnwrappedGestureHandlerEvent } from '../gestureHandlerCommon';
import { BaseGesture, BaseGestureConfig } from './gesture';
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
