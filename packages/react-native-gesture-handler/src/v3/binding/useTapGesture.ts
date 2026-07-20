import type { TapGestureConfig } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/tap/TapTypes';
import { useTapGesture as useTapGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/tap/useTapGesture';

import { runtime } from './runtime';

export function useTapGesture(config?: TapGestureConfig) {
  return useTapGestureImpl(runtime, config);
}
