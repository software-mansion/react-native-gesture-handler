import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type NativeViewGestureProps = {
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

type NativeViewGestureInternalConfig = BaseGestureConfig<
  NativeViewHandlerData,
  NativeViewGestureProps
>;

export type NativeViewGestureConfig =
  ExcludeInternalConfigProps<NativeViewGestureInternalConfig>;

export function useNative(config: NativeViewGestureConfig) {
  const nativeConfig = cloneConfig<
    NativeViewHandlerData,
    NativeViewGestureProps
  >(config);

  return useGesture(SingleGestureName.Native, nativeConfig);
}
