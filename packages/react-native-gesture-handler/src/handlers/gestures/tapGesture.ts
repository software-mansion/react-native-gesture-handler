import { BaseGestureConfig, BaseGesture } from './gesture';
import { TapGestureConfig } from '../TapGestureHandler';
import type { TapGestureHandlerEventPayload } from '../GestureHandlerEventPayload';

export class TapGesture extends BaseGesture<TapGestureHandlerEventPayload> {
  public override config: BaseGestureConfig & TapGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'TapGestureHandler';
    this.shouldCancelWhenOutside(true);
  }

  /**
   * Minimum number of pointers (fingers) required to be placed before the gesture activates.
   * Should be a positive integer. The default value is 1.
   * @param minPointers
   */
  minPointers(minPointers: number) {
    this.config.minPointers = minPointers;
    return this;
  }

  /**
   * Number of tap gestures required to activate the gesture.
   * The default value is 1.
   * @param count
   */
  numberOfTaps(count: number) {
    this.config.numberOfTaps = count;
    return this;
  }

  /**
   * Maximum distance, expressed in points, that defines how far the finger is allowed to travel during a tap gesture.
   * @param maxDist
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#maxdistancevalue-number
   */
  maxDistance(maxDist: number) {
    this.config.maxDist = maxDist;
    return this;
  }

  /**
   * Maximum time, expressed in milliseconds, that defines how fast a finger must be released after a touch.
   * The default value is 500.
   * @param duration
   */
  maxDuration(duration: number) {
    this.config.maxDurationMs = duration;
    return this;
  }

  /**
   * Maximum time, expressed in milliseconds, that can pass before the next tap — if many taps are required.
   * The default value is 500.
   * @param delay
   */
  maxDelay(delay: number) {
    this.config.maxDelayMs = delay;
    return this;
  }

  /**
   * Maximum distance, expressed in points, that defines how far the finger is allowed to travel along the X axis during a tap gesture.
   * @param delta
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#maxdeltaxvalue-number
   */
  maxDeltaX(delta: number) {
    this.config.maxDeltaX = delta;
    return this;
  }

  /**
   * Maximum distance, expressed in points, that defines how far the finger is allowed to travel along the Y axis during a tap gesture.
   * @param delta
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture#maxdeltayvalue-number
   */
  maxDeltaY(delta: number) {
    this.config.maxDeltaY = delta;
    return this;
  }
}

export type TapGestureType = InstanceType<typeof TapGesture>;
