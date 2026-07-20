import type {
  RotationGesture,
  RotationGestureConfig as CoreRotationGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import { useRotationGesture as useRotationGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/rotation/useRotationGesture';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import RotationGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/RotationGestureHandler';

import { runtime } from '../runtime';

// Importing this hook is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.Rotation, RotationGestureHandler);

// SharedValue members are stripped at this boundary — reanimated does not
// exist on the plain-DOM binding (see WithoutSharedValues).
export type RotationGestureConfig =
  WithoutSharedValues<CoreRotationGestureConfig>;

export function useRotationGesture(
  config?: RotationGestureConfig
): RotationGesture {
  return useRotationGestureImpl(
    runtime,
    config as CoreRotationGestureConfig | undefined
  );
}
