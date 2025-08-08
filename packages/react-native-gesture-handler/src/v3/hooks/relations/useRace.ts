import { NativeGesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useRace(...gestures: NativeGesture[]) {
  const composedGesture = useComposedGesture(...gestures);

  composedGesture.name = 'RaceGesture';

  return composedGesture;
}
