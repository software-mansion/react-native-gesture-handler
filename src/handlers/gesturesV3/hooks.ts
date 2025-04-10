import { FlingGestureConfig } from '../FlingGestureHandler';
import { ForceTouchGestureConfig } from '../ForceTouchGestureHandler';
import {
  FlingGestureHandlerEventPayload,
  ForceTouchGestureHandlerEventPayload,
  HoverGestureHandlerEventPayload,
  LongPressGestureHandlerEventPayload,
  NativeViewGestureHandlerPayload,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  RotationGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from '../GestureHandlerEventPayload';
import { HoverGestureConfig } from '../gestures/hoverGesture';
import { LongPressGestureConfig } from '../LongPressGestureHandler';
import { NativeViewGestureConfig } from '../NativeViewGestureHandler';
import { PanGestureConfig } from '../PanGestureHandler';
import { TapGestureConfig } from '../TapGestureHandler';
import { BaseConfigObjectType } from './types';
import { useGesture } from './useGesture';

type TapConfigType = TapGestureConfig &
  BaseConfigObjectType<TapGestureHandlerEventPayload>;
type PanConfigType = PanGestureConfig &
  BaseConfigObjectType<PanGestureHandlerEventPayload>;
type FlingConfigType = FlingGestureConfig &
  BaseConfigObjectType<FlingGestureHandlerEventPayload>;
type LongPressConfigType = LongPressGestureConfig &
  BaseConfigObjectType<LongPressGestureHandlerEventPayload>;
type PinchConfigType = BaseConfigObjectType<PinchGestureHandlerEventPayload>;
type RotationConfigType =
  BaseConfigObjectType<RotationGestureHandlerEventPayload>;
type HoverConfigType = HoverGestureConfig &
  BaseConfigObjectType<HoverGestureHandlerEventPayload>;
type ForceTouchConfigType = ForceTouchGestureConfig &
  BaseConfigObjectType<ForceTouchGestureHandlerEventPayload>;
type ManualConfigType = BaseConfigObjectType<Record<string, unknown>>;
type NativeConfigType = NativeViewGestureConfig &
  BaseConfigObjectType<NativeViewGestureHandlerPayload>;

export function useTap(config: TapConfigType) {
  return useGesture('TapGestureHandler', config);
}

export function usePan(config: PanConfigType) {
  return useGesture('PanGestureHandler', config);
}

export function useFling(config: FlingConfigType) {
  return useGesture('FlingGestureHandler', config);
}

export function useLongPress(config: LongPressConfigType) {
  return useGesture('LongPressGestureHandler', config);
}

export function usePinch(config: PinchConfigType) {
  return useGesture('PinchGestureHandler', config);
}

export function useRotation(config: RotationConfigType) {
  return useGesture('RotationGestureHandler', config);
}

export function useHover(config: HoverConfigType) {
  return useGesture('HoverGestureHandler', config);
}

export function useForceTouch(config: ForceTouchConfigType) {
  return useGesture('ForceTouchGestureHandler', config);
}

export function useManual(config: ManualConfigType) {
  return useGesture('ManualGestureHandler', config);
}

export function useNative(config: NativeConfigType) {
  return useGesture('NativeViewGestureHandler', config);
}
