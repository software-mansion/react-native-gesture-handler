import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type NativeViewGestureHandlerProps = {
  /**
   * Android only.
   *
   * Determines whether the handler should check for an existing touch event on
   * instantiation.
   */
  shouldActivateOnStart?: boolean;

  /**
   * When `true`, cancels all other gesture handlers when this
   * `NativeViewGestureHandler` receives an `ACTIVE` state event.
   */
  disallowInterruption?: boolean;
};

type NativeViewHandlerData = {
  pointerInside: boolean;
};

type NativeViewGestureHandlerInternalConfig = BaseGestureConfig<
  NativeViewHandlerData,
  NativeViewGestureHandlerProps
>;

export type NativeViewGestureConfig =
  ExcludeInternalConfigProps<NativeViewGestureHandlerInternalConfig>;

export function useNative(config: NativeViewGestureConfig) {
  const nativeConfig = cloneConfig<
    NativeViewHandlerData,
    NativeViewGestureHandlerProps
  >(config);

  return useGesture(SingleGestureName.Native, nativeConfig);
}
