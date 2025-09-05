import {
  NativeGesture,
  ComposedGesture,
  ComposedGestureType,
} from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useExclusive(...gestures: (NativeGesture | ComposedGesture)[]) {
  const composedGesture = useComposedGesture(...gestures);

  composedGesture.type = ComposedGestureType.Exclusive;

  return composedGesture;
}
