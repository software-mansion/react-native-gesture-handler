import type {
  ManualGesture,
  ManualGestureConfig as CoreManualGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import { useManualGesture as useManualGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/manual/useManualGesture';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import ManualGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/ManualGestureHandler';

import { runtime } from '../runtime';

// Importing this hook is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.Manual, ManualGestureHandler);

// SharedValue members are stripped at this boundary — reanimated does not
// exist on the plain-DOM binding (see WithoutSharedValues).
export type ManualGestureConfig = WithoutSharedValues<CoreManualGestureConfig>;

export function useManualGesture(config?: ManualGestureConfig): ManualGesture {
  return useManualGestureImpl(
    runtime,
    config as CoreManualGestureConfig | undefined
  );
}
