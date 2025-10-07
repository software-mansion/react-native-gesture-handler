import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGesture,
  SingleGestureName,
  WithSharedValue,
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from '../../types';
import { useGesture } from '../useGesture';
import { cloneConfig } from '../utils';

type NativeViewGestureProperties = WithSharedValue<{
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
}>;

type NativeViewHandlerData = {
  pointerInside: boolean;
};

type NativeViewGestureInternalConfig = BaseGestureConfig<
  NativeViewHandlerData,
  NativeViewGestureProperties
>;

export type NativeViewGestureConfig =
  ExcludeInternalConfigProps<NativeViewGestureInternalConfig>;

export function useNative(config: NativeViewGestureConfig) {
  const nativeConfig = cloneConfig<
    NativeViewHandlerData,
    NativeViewGestureProperties
  >(config);

  return useGesture(SingleGestureName.Native, nativeConfig);
}

export type NativeGestureEvent =
  | GestureStateChangeEvent<NativeViewHandlerData>
  | GestureUpdateEvent<NativeViewHandlerData>;

export type NativeGesture = SingleGesture<
  NativeViewHandlerData,
  NativeViewGestureProperties
>;
