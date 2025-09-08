import {
  ComposedGesture,
  ComposedGestureType,
  NativeGesture,
} from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useSimultaneous(
  ...gestures: (NativeGesture<unknown, unknown> | ComposedGesture)[]
) {
  const composedGesture = useComposedGesture(...gestures);

  composedGesture.type = ComposedGestureType.Simultaneous;

  return composedGesture;
}
