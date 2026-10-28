import type {
  NativeGesture,
  NativeGestureNativeProperties,
  NativeHandlerData,
} from '../hooks/gestures/native/NativeTypes';
import type {
  CommonGestureConfig,
  ExternalRelations,
  GestureCallbacks,
} from '.';

export type WrapperSpecificProperties<T = unknown> = {
  ref?: React.Ref<T> | undefined;
  onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER?: (
    gesture: NativeGesture
  ) => void;
};

// Wrapped components always run their callbacks on the JS thread, so the
// Reanimated-only config has no effect on them.
export type NativeWrapperProperties<T = unknown> = Omit<
  CommonGestureConfig,
  'disableReanimated' | 'runOnJS'
> &
  GestureCallbacks<NativeHandlerData> &
  NativeGestureNativeProperties &
  ExternalRelations &
  WrapperSpecificProperties<T>;
