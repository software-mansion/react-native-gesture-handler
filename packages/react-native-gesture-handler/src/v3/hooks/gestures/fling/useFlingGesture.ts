import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import type {
  FlingGesture,
  FlingGestureConfig,
  FlingGestureProperties,
  FlingHandlerData,
} from './FlingTypes';

const EMPTY_FLING_CONFIG: FlingGestureConfig = {};

export function useFlingGesture(
  config: FlingGestureConfig = EMPTY_FLING_CONFIG
): FlingGesture {
  const flingConfig = useClonedAndRemappedConfig<
    FlingGestureProperties,
    FlingHandlerData
  >(config);

  return useGesture(SingleGestureName.Fling, flingConfig);
}
