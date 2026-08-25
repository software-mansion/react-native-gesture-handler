import type {
  PanGesture,
  PanGestureConfig as CorePanGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import { usePanGesture as usePanGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/pan/usePanGesture';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import PanGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/PanGestureHandler';

import { runtime } from '../runtime';

// Importing this hook is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.Pan, PanGestureHandler);

// SharedValue members are stripped at this boundary — reanimated does not
// exist on the plain-DOM binding (see WithoutSharedValues).
export type PanGestureConfig = WithoutSharedValues<CorePanGestureConfig>;

export function usePanGesture(config?: PanGestureConfig): PanGesture {
  return usePanGestureImpl(runtime, config as CorePanGestureConfig | undefined);
}
