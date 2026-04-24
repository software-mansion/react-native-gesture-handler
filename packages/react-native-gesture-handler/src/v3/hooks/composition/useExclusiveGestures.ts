import { AnyGesture, ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useExclusiveGestures(...gestures: AnyGesture[]) {
  const composedGesture = useComposedGesture(
    ComposedGestureName.Exclusive,
    ...gestures
  );

  composedGesture.type = ComposedGestureName.Exclusive;

  return composedGesture;
}
