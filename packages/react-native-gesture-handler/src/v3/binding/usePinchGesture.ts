import type { PinchGestureConfig } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/pinch/PinchTypes';
import { usePinchGesture as usePinchGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/pinch/usePinchGesture';

import { runtime } from './runtime';

export function usePinchGesture(config?: PinchGestureConfig) {
  return usePinchGestureImpl(runtime, config);
}
