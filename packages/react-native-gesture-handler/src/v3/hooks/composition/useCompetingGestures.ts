import type { AnyGesture } from '../../types';
import { ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useCompetingGestures(...gestures: AnyGesture[]) {
  return useComposedGesture(ComposedGestureName.Race, ...gestures);
}
