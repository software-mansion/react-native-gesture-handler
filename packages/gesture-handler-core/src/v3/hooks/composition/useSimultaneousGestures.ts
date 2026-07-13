import type { CoreRuntime } from '../../platform/Port';
import type { AnyGesture } from '../../types';
import { ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useSimultaneousGestures(
  runtime: CoreRuntime,
  ...gestures: AnyGesture[]
) {
  const composedGesture = useComposedGesture(
    runtime,
    ComposedGestureName.Simultaneous,
    ...gestures
  );

  return composedGesture;
}
