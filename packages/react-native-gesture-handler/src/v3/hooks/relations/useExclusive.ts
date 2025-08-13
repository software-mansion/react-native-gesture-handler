import { NativeGesture, ComposedGesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useExclusive(...gestures: (NativeGesture | ComposedGesture)[]) {
  const composedGesture = useComposedGesture(...gestures);

  composedGesture.name = 'ExclusiveGesture';

  return composedGesture;
}
