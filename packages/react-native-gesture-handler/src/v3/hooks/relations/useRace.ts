import { ComposedGesture, NativeGesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useRace(
  ...gestures: (NativeGesture<unknown, unknown> | ComposedGesture)[]
) {
  return useComposedGesture(...gestures);
}
