import { ComposedGesture, NativeGesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useSimultaneous(
  ...gestures: (NativeGesture | ComposedGesture)[]
) {
  const composedGesture = useComposedGesture(...gestures);

  composedGesture.name = 'SimultaneousGesture';

  return composedGesture;
}
