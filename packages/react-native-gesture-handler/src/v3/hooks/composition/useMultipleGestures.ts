import { AnyGesture, ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useMultipleGestures(...gestures: AnyGesture[]) {
  return useComposedGesture(ComposedGestureName.Race, ...gestures);
}
