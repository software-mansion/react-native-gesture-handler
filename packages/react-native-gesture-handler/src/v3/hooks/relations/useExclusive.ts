import { ComposedGestureName, Gesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useExclusive(...gestures: Gesture<unknown, unknown>[]) {
  const composedGesture = useComposedGesture(
    ComposedGestureName.Exclusive,
    ...gestures
  );

  composedGesture.type = ComposedGestureName.Exclusive;

  return composedGesture;
}
