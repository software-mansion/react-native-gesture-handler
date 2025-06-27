import type { FlingGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import { BaseGestureHandlerProps } from './gestureHandlerCommon';

export const flingGestureHandlerProps = [
  'numberOfPointers',
  'direction',
] as const;

export interface FlingGestureConfig {
  /**
   * Expressed allowed direction of movement. It's possible to pass one or many
   * directions in one parameter:
   *
   * ```js
   * direction={Directions.RIGHT | Directions.LEFT}
   * ```
   *
   * or
   *
   * ```js
   * direction={Directions.DOWN}
   * ```
   */
  direction?: number;

  /**
   * Determine exact number of points required to handle the fling gesture.
   */
  numberOfPointers?: number;
}

/**
 * @deprecated FlingGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Fling()` instead.
 */
export interface FlingGestureHandlerProps
  extends BaseGestureHandlerProps<FlingGestureHandlerEventPayload>,
    FlingGestureConfig {}

export const flingHandlerName = 'FlingGestureHandler';
