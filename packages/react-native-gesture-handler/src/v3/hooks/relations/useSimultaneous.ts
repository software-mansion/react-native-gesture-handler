import { ComposedGestureName, Gesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useSimultaneous(...gestures: Gesture<unknown, unknown>[]) {
  const composedGesture = useComposedGesture(
    ComposedGestureName.Simultaneous,
    ...gestures
  );

  return composedGesture;
}
