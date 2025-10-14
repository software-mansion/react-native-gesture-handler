import { AnyGesture, ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useRace(...gestures: AnyGesture[]) {
  return useComposedGesture(ComposedGestureName.Race, ...gestures);
}
