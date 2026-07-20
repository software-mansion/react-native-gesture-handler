import type {
  AnyGesture,
  ComposedGestureName,
} from '@swmansion/gesture-handler-core';
import { useCompetingGestures as useCompetingGesturesImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/composition/useCompetingGestures';
import { useComposedGesture as useComposedGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/composition/useComposedGesture';
import { useExclusiveGestures as useExclusiveGesturesImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/composition/useExclusiveGestures';
import { useSimultaneousGestures as useSimultaneousGesturesImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/composition/useSimultaneousGestures';

import { runtime } from './runtime';

export function useComposedGesture(
  type: ComposedGestureName,
  ...gestures: AnyGesture[]
) {
  return useComposedGestureImpl(runtime, type, ...gestures);
}

export function useSimultaneousGestures(...gestures: AnyGesture[]) {
  return useSimultaneousGesturesImpl(runtime, ...gestures);
}

export function useCompetingGestures(...gestures: AnyGesture[]) {
  return useCompetingGesturesImpl(runtime, ...gestures);
}

export function useExclusiveGestures(...gestures: AnyGesture[]) {
  return useExclusiveGesturesImpl(runtime, ...gestures);
}
