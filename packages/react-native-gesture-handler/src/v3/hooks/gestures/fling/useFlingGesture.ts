import type {
  FlingGesture,
  FlingGestureConfig,
  FlingGestureProperties,
  FlingHandlerData,
} from './FlingTypes';
import { SingleGestureName } from '../../../types';
import { useClonedAndRemappedConfig } from '../../utils';
import { useGesture } from '../../useGesture';

export function useFlingGesture(config: FlingGestureConfig): FlingGesture {
  const flingConfig = useClonedAndRemappedConfig<
    FlingGestureProperties,
    FlingHandlerData
  >(config);

  return useGesture(SingleGestureName.Fling, flingConfig);
}
