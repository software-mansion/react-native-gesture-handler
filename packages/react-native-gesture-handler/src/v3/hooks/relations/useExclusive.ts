import { ComposedGestureType, Gesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useExclusive(...gestures: Gesture[]) {
  const composedGesture = useComposedGesture(
    ComposedGestureType.Exclusive,
    ...gestures
  );

  composedGesture.type = ComposedGestureType.Exclusive;

  return composedGesture;
}
