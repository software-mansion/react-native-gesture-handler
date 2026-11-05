import type {
  BaseDiscreteGestureConfig,
  ExcludeInternalConfigProps,
  GestureEndEvent,
  GestureEvent,
  SingleGesture,
  WithSharedValue,
} from '../../../types';

export type FlingGestureNativeProperties = {
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
};

export const FlingNativeProperties = new Set<
  keyof FlingGestureNativeProperties
>(['direction', 'numberOfPointers']);

export type FlingHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export type FlingGestureProperties =
  WithSharedValue<FlingGestureNativeProperties>;

export type FlingGestureInternalConfig = BaseDiscreteGestureConfig<
  FlingGestureProperties,
  FlingHandlerData
>;

export type FlingGestureConfig =
  ExcludeInternalConfigProps<FlingGestureInternalConfig>;

export type FlingGestureBeginEvent = GestureEvent<FlingHandlerData>;
export type FlingGestureActiveEvent = FlingGestureBeginEvent;
export type FlingGestureDeactivateEvent = GestureEndEvent<FlingHandlerData>;
export type FlingGestureFinalizeEvent = GestureEndEvent<FlingHandlerData>;
/** @deprecated Use `FlingGestureBeginEvent` instead. */
export type FlingGestureEvent = FlingGestureBeginEvent;

export type FlingGesture = SingleGesture<
  FlingGestureProperties,
  FlingHandlerData
>;
