import type { RotationGestureConfig } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/rotation/RotationTypes';
import { useRotationGesture as useRotationGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/rotation/useRotationGesture';

import { runtime } from './runtime';

export function useRotationGesture(config?: RotationGestureConfig) {
  return useRotationGestureImpl(runtime, config);
}
