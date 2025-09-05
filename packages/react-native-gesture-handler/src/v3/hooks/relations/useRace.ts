import { ComposedGesture, NativeGesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useRace(...gestures: (NativeGesture | ComposedGesture)[]) {
  return useComposedGesture(...gestures);
}
