import { ComposedGestureType, Gesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useSimultaneous(...gestures: Gesture[]) {
  const composedGesture = useComposedGesture(
    ComposedGestureType.Simultaneous,
    ...gestures
  );

  return composedGesture;
}
