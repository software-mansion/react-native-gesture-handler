import type { CoreRuntime } from '../../platform/Port';
import type { AnyGesture } from '../../types';
import { ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useCompetingGestures(
  runtime: CoreRuntime,
  ...gestures: AnyGesture[]
) {
  return useComposedGesture(runtime, ComposedGestureName.Race, ...gestures);
}
