import { LongPressGestureHandlerEventPayload } from './GestureHandlerEventPayload';
import createHandler from './createHandler';
import {
  BaseGestureHandlerProps,
  baseGestureHandlerProps,
} from './gestureHandlerCommon';

export const longPressGestureHandlerProps = [
  'minDurationMs',
  'maxDist',
  'numberOfPointers',
] as const;

export interface LongPressGestureConfig {
  /**
   * Minimum time, expressed in milliseconds, that a finger must remain pressed on
   * the corresponding view. The default value is 500.
   */
  minDurationMs?: number;

  /**
   * Maximum distance, expressed in points, that defines how far the finger is
   * allowed to travel during a long press gesture. If the finger travels
   * further than the defined distance and the handler hasn't yet activated, it
   * will fail to recognize the gesture. The default value is 10.
   */
  maxDist?: number;

  /**
   * Determine exact number of points required to handle the long press gesture.
   */
  numberOfPointers?: number;
}

/**
 * @deprecated LongPressGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.LongPress()` instead.
 */
export interface LongPressGestureHandlerProps
  extends BaseGestureHandlerProps<LongPressGestureHandlerEventPayload>,
    LongPressGestureConfig {}

export const longPressHandlerName = 'LongPressGestureHandler';

/**
 * @deprecated LongPressGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.LongPress()` instead.
 */
export type LongPressGestureHandler = typeof LongPressGestureHandler;

/**
 * @deprecated LongPressGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.LongPress()` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const LongPressGestureHandler = createHandler<
  LongPressGestureHandlerProps,
  LongPressGestureHandlerEventPayload
>({
  name: longPressHandlerName,
  allowedProps: [
    ...baseGestureHandlerProps,
    ...longPressGestureHandlerProps,
  ] as const,
  config: {
    shouldCancelWhenOutside: true,
  },
});
