import type { FlingGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

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

/**
 * @deprecated FlingGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Fling()` instead.
 */
export type FlingGestureHandler = typeof FlingGestureHandler;

/**
 * @deprecated FlingGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Fling()` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const FlingGestureHandler = createHandler<
  FlingGestureHandlerProps,
  FlingGestureHandlerEventPayload
>({
  name: flingHandlerName,
  allowedProps: [
    ...baseGestureHandlerProps,
    ...flingGestureHandlerProps,
  ] as const,
  config: {},
});
