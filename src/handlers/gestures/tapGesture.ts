import { BaseGestureConfig, BaseGesture } from './gesture';
import {
  TapGestureConfig,
  TapGestureHandlerEventPayload,
} from '../TapGestureHandler';

export class TapGesture extends BaseGesture<TapGestureHandlerEventPayload> {
  public config: BaseGestureConfig & TapGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'TapGestureHandler';
  }

  setTapCount(count: number) {
    this.config.numberOfTaps = count;
    return this;
  }

  setMaxDistance(maxDist: number) {
    this.config.maxDist = maxDist;
    return this;
  }

  setMaxDuration(duration: number) {
    this.config.maxDurationMs = duration;
    return this;
  }

  setMaxDelay(delay: number) {
    this.config.maxDelayMs = delay;
    return this;
  }

  setMaxDeltaX(delta: number) {
    this.config.maxDeltaX = delta;
    return this;
  }

  setMaxDeltaY(delta: number) {
    this.config.maxDeltaY = delta;
    return this;
  }
}
