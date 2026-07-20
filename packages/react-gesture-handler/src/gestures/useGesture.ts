import type {
  BaseGestureConfig,
  SingleGesture,
  SingleGestureName,
} from '@swmansion/gesture-handler-core';
import { useGesture as useGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/useGesture';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { Gestures } from '@swmansion/gesture-handler-dom-engine/src/Gestures';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';

import { runtime } from '../runtime';

// The generic by-name API cannot know which recognizer it will be asked for,
// so importing it registers ALL handler classes — this is the documented
// escape hatch that opts a bundle out of per-gesture tree-shaking. Prefer
// the concrete use*Gesture hooks.
for (const [name, handlerClass] of Object.entries(Gestures)) {
  registerHandlerClass(name as SingleGestureName, handlerClass);
}

export function useGesture<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData = THandlerData,
>(
  type: SingleGestureName,
  config: WithoutSharedValues<
    BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
  >
): SingleGesture<TConfig, THandlerData, TExtendedHandlerData> {
  return useGestureImpl<TConfig, THandlerData, TExtendedHandlerData>(
    runtime,
    type,
    config as BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
  );
}
