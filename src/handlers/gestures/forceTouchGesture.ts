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

  onUpdate(
    callback: (
      event: UnwrappedGestureHandlerEvent<ForceTouchGestureHandlerEventPayload>
    ) => void
  ) {
    this.handlers.onUpdate = callback;
    //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
    this.handlers.isOnUpdateWorklet = callback.__workletHash != null;
    return this;
  }

  minForce(force: number) {
    this.config.minForce = force;
    return this;
  }

  maxForce(force: number) {
    this.config.maxForce = force;
    return this;
  }

  feedbackOnActivation(value: boolean) {
    this.config.feedbackOnActivation = value;
    return this;
  }
}
