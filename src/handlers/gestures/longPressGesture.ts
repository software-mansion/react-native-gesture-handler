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
    this.shouldCancelWhenOutside(true);
  }

  /**
   * Minimum time, expressed in milliseconds, that a finger must remain pressed on the corresponding view.
   * The default value is 500.
   * @param duration
   */
  minDuration(duration: number) {
    this.config.minDurationMs = duration;
    return this;
  }

  /**
   * Maximum distance, expressed in points, that defines how far the finger is allowed to travel during a long press gesture.
   * @param distance
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/long-press-gesture#maxdistancevalue-number
   */
  maxDistance(distance: number) {
    this.config.maxDist = distance;
    return this;
  }
}

export type LongPressGestureType = InstanceType<typeof LongPressGesture>;
