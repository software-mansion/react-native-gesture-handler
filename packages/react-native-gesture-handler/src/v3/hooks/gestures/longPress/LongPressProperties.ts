type CommonLongPressGestureProperties = {
  /**
   * Determine exact number of points required to handle the long press gesture.
   */
  numberOfPointers?: number;
};

export type LongPressGestureExternalProperties =
  CommonLongPressGestureProperties & {
    /**
     * Minimum time, expressed in milliseconds, that a finger must remain pressed on
     * the corresponding view. The default value is 500.
     */
    minDuration?: number;

    /**
     * Maximum distance, expressed in points, that defines how far the finger is
     * allowed to travel during a long press gesture. If the finger travels
     * further than the defined distance and the handler hasn't yet activated, it
     * will fail to recognize the gesture. The default value is 10.
     */
    maxDistance?: number;
  };

export type LongPressGestureNativeProperties =
  CommonLongPressGestureProperties & {
    minDurationMs?: number;
    maxDist?: number;
  };

export const LongPressNativeProperties = new Set<
  keyof LongPressGestureNativeProperties
>(['minDurationMs', 'maxDist', 'numberOfPointers']);
