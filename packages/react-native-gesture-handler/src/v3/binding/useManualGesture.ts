import type { ManualGestureConfig } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/manual/ManualTypes';
import { useManualGesture as useManualGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/manual/useManualGesture';

import { runtime } from './runtime';

export function useManualGesture(config?: ManualGestureConfig) {
  return useManualGestureImpl(runtime, config);
}
