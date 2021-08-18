import { BaseGesture, BaseGestureConfig } from './gesture';
import {
  LongPressGestureConfig,
  LongPressGestureHandlerEventPayload,
} from '../LongPressGestureHandler';

export class LongPressGesture extends BaseGesture<LongPressGestureHandlerEventPayload> {
  public config: BaseGestureConfig & LongPressGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'LongPressGestureHandler';
  }

  setMinDuration(duration: number) {
    this.config.minDurationMs = duration;
    return this;
  }

  setMaxDistance(distance: number) {
    this.config.maxDist = distance;
    return this;
  }
}
