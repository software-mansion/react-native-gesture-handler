import type { LongPressGestureConfig } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/longPress/LongPressTypes';
import { useLongPressGesture as useLongPressGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/longPress/useLongPressGesture';

import { runtime } from './runtime';

export function useLongPressGesture(config?: LongPressGestureConfig) {
  return useLongPressGestureImpl(runtime, config);
}
