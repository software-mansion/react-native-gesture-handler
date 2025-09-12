import { ComposedGestureName, Gesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useSimultaneous(...gestures: Gesture[]) {
  const composedGesture = useComposedGesture(
    ComposedGestureName.Simultaneous,
    ...gestures
  );

  return composedGesture;
}
