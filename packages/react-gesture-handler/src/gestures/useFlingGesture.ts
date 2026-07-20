import { useFlingGesture as useFlingGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/fling/useFlingGesture';
import type {
  FlingGesture,
  FlingGestureConfig as CoreFlingGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import FlingGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/FlingGestureHandler';

import { runtime } from '../runtime';

// Importing this hook is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.Fling, FlingGestureHandler);

// SharedValue members are stripped at this boundary — reanimated does not
// exist on the plain-DOM binding (see WithoutSharedValues).
export type FlingGestureConfig = WithoutSharedValues<CoreFlingGestureConfig>;

export function useFlingGesture(config?: FlingGestureConfig): FlingGesture {
  return useFlingGestureImpl(
    runtime,
    config as CoreFlingGestureConfig | undefined
  );
}
