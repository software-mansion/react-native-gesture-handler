import { BaseGestureConfig, ContinousBaseGesture } from './gesture';
import {
  ForceTouchGestureConfig,
  ForceTouchGestureHandlerEventPayload,
} from '../ForceTouchGestureHandler';

export class ForceTouchGesture extends ContinousBaseGesture<ForceTouchGestureHandlerEventPayload> {
  public config: BaseGestureConfig & ForceTouchGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'ForceTouchGestureHandler';
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
