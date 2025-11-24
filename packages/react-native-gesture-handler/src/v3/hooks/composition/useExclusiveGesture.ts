import { AnyGesture, ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useExclusiveGesture(...gestures: AnyGesture[]) {
  const composedGesture = useComposedGesture(
    ComposedGestureName.Exclusive,
    ...gestures
  );

  composedGesture.type = ComposedGestureName.Exclusive;

  return composedGesture;
}
