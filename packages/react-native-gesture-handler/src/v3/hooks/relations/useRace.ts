import { ComposedGestureName, Gesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useRace(...gestures: Gesture<unknown, unknown>[]) {
  return useComposedGesture(ComposedGestureName.Race, ...gestures);
}
