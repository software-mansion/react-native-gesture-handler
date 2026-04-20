import type { FlingGestureConfig } from '../FlingGestureHandler';
import type { FlingGestureHandlerEventPayload } from '../GestureHandlerEventPayload';
import type { BaseGestureConfig } from './gesture';
import { BaseGesture } from './gesture';

/**
 * @deprecated Fling Gesture is deprecated and will be removed in the future. Please use `useFlingGesture` instead.
 */
export class FlingGesture extends BaseGesture<FlingGestureHandlerEventPayload> {
  public override config: BaseGestureConfig & FlingGestureConfig = {};

  constructor() {
    super();

    this.handlerName = 'FlingGestureHandler';
  }

  /**
   * Determine exact number of points required to handle the fling gesture.
   * @param pointers
   */
  numberOfPointers(pointers: number) {
    this.config.numberOfPointers = pointers;
    return this;
  }

  /**
   * Expressed allowed direction of movement.
   * Expected values are exported as constants in the Directions object.
   * Arguments can be combined using `|` operator. Default value is set to `Directions.RIGHT`.
   * @param direction
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/fling-gesture/#directionvalue-directions
   */
  direction(direction: number) {
    this.config.direction = direction;
    return this;
  }
}

/**
 * @deprecated Fling Gesture is deprecated and will be removed in the future. Please use `useFlingGesture` instead.
 */
export type FlingGestureType = InstanceType<typeof FlingGesture>;
