import { useHoverGesture as useHoverGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/hover/useHoverGesture';
import type {
  HoverGesture,
  HoverGestureConfig as CoreHoverGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import HoverGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/HoverGestureHandler';

import { runtime } from '../runtime';

// Importing this hook is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.Hover, HoverGestureHandler);

// SharedValue members are stripped at this boundary — reanimated does not
// exist on the plain-DOM binding (see WithoutSharedValues).
export type HoverGestureConfig = WithoutSharedValues<CoreHoverGestureConfig>;

export function useHoverGesture(config?: HoverGestureConfig): HoverGesture {
  return useHoverGestureImpl(
    runtime,
    config as CoreHoverGestureConfig | undefined
  );
}
