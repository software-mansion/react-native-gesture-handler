import type { FlingGestureConfig } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/fling/FlingTypes';
import { useFlingGesture as useFlingGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/fling/useFlingGesture';

import { runtime } from './runtime';

export function useFlingGesture(config?: FlingGestureConfig) {
  return useFlingGestureImpl(runtime, config);
}
