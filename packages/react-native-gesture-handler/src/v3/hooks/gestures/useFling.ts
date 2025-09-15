import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type FlingGestureProps = {
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

type FlingHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

type FlingGestureInternalConfig = BaseGestureConfig<
  FlingHandlerData,
  FlingGestureProps
>;

export type FlingGestureConfig =
  ExcludeInternalConfigProps<FlingGestureInternalConfig>;

export function useFling(config: FlingGestureConfig) {
  const flingConfig = cloneConfig<FlingHandlerData, FlingGestureProps>(config);

  return useGesture(SingleGestureName.Fling, flingConfig);
}
