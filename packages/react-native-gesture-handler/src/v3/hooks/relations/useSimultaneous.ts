import { AnyGesture, ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useSimultaneous(...gestures: AnyGesture[]) {
  const composedGesture = useComposedGesture(
    ComposedGestureName.Simultaneous,
    ...gestures
  );

  return composedGesture;
}
