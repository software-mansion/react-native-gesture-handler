import type {
  LongPressGesture,
  LongPressGestureConfig as CoreLongPressGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import { useLongPressGesture as useLongPressGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/longPress/useLongPressGesture';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import LongPressGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/LongPressGestureHandler';

import { runtime } from '../runtime';

// Importing this hook is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.LongPress, LongPressGestureHandler);

// SharedValue members are stripped at this boundary — reanimated does not
// exist on the plain-DOM binding (see WithoutSharedValues).
export type LongPressGestureConfig =
  WithoutSharedValues<CoreLongPressGestureConfig>;

export function useLongPressGesture(
  config?: LongPressGestureConfig
): LongPressGesture {
  return useLongPressGestureImpl(
    runtime,
    config as CoreLongPressGestureConfig | undefined
  );
}
