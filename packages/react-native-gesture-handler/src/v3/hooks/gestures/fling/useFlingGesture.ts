import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import type {
  FlingGesture,
  FlingGestureConfig,
  FlingGestureProperties,
  FlingHandlerData,
} from './FlingTypes';

export function useFlingGesture(config: FlingGestureConfig): FlingGesture {
  const flingConfig = useClonedAndRemappedConfig<
    FlingGestureProperties,
    FlingHandlerData
  >(config);

  return useGesture(SingleGestureName.Fling, flingConfig);
}
