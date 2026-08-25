import type { NativeGestureConfig } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/native/NativeTypes';
import { useNativeGesture as useNativeGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/native/useNativeGesture';

import { runtime } from './runtime';

export function useNativeGesture(config?: NativeGestureConfig) {
  return useNativeGestureImpl(runtime, config);
}
