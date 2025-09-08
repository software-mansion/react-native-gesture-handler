import { ComposedGestureType, Gesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useRace(...gestures: Gesture[]) {
  return useComposedGesture(ComposedGestureType.Race, ...gestures);
}
