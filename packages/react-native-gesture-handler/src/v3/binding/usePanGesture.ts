import type { PanGestureConfig } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/pan/PanTypes';
import { usePanGesture as usePanGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/pan/usePanGesture';

import { runtime } from './runtime';

export function usePanGesture(config?: PanGestureConfig) {
  return usePanGestureImpl(runtime, config);
}
