import type { CoreRuntime } from '../../platform/Port';
import type { AnyGesture } from '../../types';
import { ComposedGestureName } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useExclusiveGestures(
  runtime: CoreRuntime,
  ...gestures: AnyGesture[]
) {
  const composedGesture = useComposedGesture(
    runtime,
    ComposedGestureName.Exclusive,
    ...gestures
  );

  composedGesture.type = ComposedGestureName.Exclusive;

  return composedGesture;
}
