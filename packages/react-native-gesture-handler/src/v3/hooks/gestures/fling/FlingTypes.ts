import {
  BaseDiscreteGestureConfig,
  ExcludeInternalConfigProps,
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

export type FlingGestureEvent = GestureEvent<FlingHandlerData>;
export type FlingGestureActiveEvent = FlingGestureEvent;

export type FlingGesture = SingleGesture<
  FlingGestureProperties,
  FlingHandlerData
>;
