import {
  BaseDiscreteGestureConfig,
  ExcludeInternalConfigProps,
  GestureEvent,
  SingleGesture,
  WithSharedValue,
} from '../../../types';

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

export type LongPressHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  duration: number;
};

export type LongPressGestureProperties =
  WithSharedValue<LongPressGestureExternalProperties>;

export type LongPressGestureInternalProperties =
  WithSharedValue<LongPressGestureNativeProperties>;

export type LongPressGestureConfig = ExcludeInternalConfigProps<
  BaseDiscreteGestureConfig<LongPressGestureProperties, LongPressHandlerData>
>;

export type LongPressGestureInternalConfig = BaseDiscreteGestureConfig<
  LongPressGestureInternalProperties,
  LongPressHandlerData
>;

export type LongPressGestureEvent = GestureEvent<LongPressHandlerData>;
export type LongPressGestureActiveEvent = LongPressGestureEvent;

export type LongPressGesture = SingleGesture<
  LongPressGestureProperties,
  LongPressHandlerData
>;
