import { NativeGesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useExclusive(...gestures: NativeGesture[]) {
  const composedGesture = useComposedGesture(...gestures);

  const tags = gestures.flatMap((gesture) => gesture.tag);

  for (let i = 0; i < gestures.length; i++) {
    gestures[i].config.waitFor = tags.slice(0, i);
  }

  composedGesture.name = 'ExclusiveGesture';

  return composedGesture;
}
