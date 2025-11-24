import { AnyGesture, ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useRaceGesture(...gestures: AnyGesture[]) {
  return useComposedGesture(ComposedGestureName.Race, ...gestures);
}
