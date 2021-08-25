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

  maxForce(force: number) {
    this.config.maxForce = force;
    return this;
  }

  feedbackOnActivation(value: boolean) {
    this.config.feedbackOnActivation = value;
    return this;
  }
}
