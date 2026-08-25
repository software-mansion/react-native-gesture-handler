import type { HoverGestureConfig } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/hover/HoverTypes';
import { useHoverGesture as useHoverGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/hover/useHoverGesture';

import { runtime } from './runtime';

export function useHoverGesture(config?: HoverGestureConfig) {
  return useHoverGestureImpl(runtime, config);
}
