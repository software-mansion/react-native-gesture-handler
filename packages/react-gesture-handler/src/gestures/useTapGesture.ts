import type {
  TapGesture,
  TapGestureConfig as CoreTapGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import { useTapGesture as useTapGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/tap/useTapGesture';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import TapGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/TapGestureHandler';

import { runtime } from '../runtime';

// Importing this hook is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.Tap, TapGestureHandler);

// SharedValue members are stripped at this boundary — reanimated does not
// exist on the plain-DOM binding (see WithoutSharedValues).
export type TapGestureConfig = WithoutSharedValues<CoreTapGestureConfig>;

export function useTapGesture(config?: TapGestureConfig): TapGesture {
  return useTapGestureImpl(runtime, config as CoreTapGestureConfig | undefined);
}
