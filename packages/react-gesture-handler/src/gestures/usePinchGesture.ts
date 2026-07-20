import type {
  PinchGesture,
  PinchGestureConfig as CorePinchGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import { usePinchGesture as usePinchGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/pinch/usePinchGesture';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import PinchGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/PinchGestureHandler';

import { runtime } from '../runtime';

// Importing this hook is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.Pinch, PinchGestureHandler);

// SharedValue members are stripped at this boundary — reanimated does not
// exist on the plain-DOM binding (see WithoutSharedValues).
export type PinchGestureConfig = WithoutSharedValues<CorePinchGestureConfig>;

export function usePinchGesture(config?: PinchGestureConfig): PinchGesture {
  return usePinchGestureImpl(
    runtime,
    config as CorePinchGestureConfig | undefined
  );
}
