import { ComposedGestureType, Gesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useExclusive(...gestures: Gesture<unknown, unknown>[]) {
  const composedGesture = useComposedGesture(
    ComposedGestureType.Exclusive,
    ...gestures
  );

  composedGesture.type = ComposedGestureType.Exclusive;

  return composedGesture;
}
