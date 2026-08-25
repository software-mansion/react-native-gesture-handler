import type {
  NativeGesture,
  NativeGestureConfig as CoreNativeGestureConfig,
} from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/index';
import { useNativeGesture as useNativeGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/gestures/native/useNativeGesture';
import { SingleGestureName } from '@swmansion/gesture-handler-core/src/v3/types/GestureTypes';
import type { WithoutSharedValues } from '@swmansion/gesture-handler-core/src/v3/types/ReanimatedTypes';
import { registerHandlerClass } from '@swmansion/gesture-handler-dom-engine/src/handlerRegistry';
import NativeViewGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/NativeViewGestureHandler';

import { runtime } from '../runtime';

// Importing this hook is what puts the recognizer class in the bundle.
registerHandlerClass(SingleGestureName.Native, NativeViewGestureHandler);

// SharedValue members are stripped at this boundary — reanimated does not
// exist on the plain-DOM binding (see WithoutSharedValues).
export type NativeGestureConfig = WithoutSharedValues<CoreNativeGestureConfig>;

export function useNativeGesture(config?: NativeGestureConfig): NativeGesture {
  return useNativeGestureImpl(
    runtime,
    config as CoreNativeGestureConfig | undefined
  );
}
