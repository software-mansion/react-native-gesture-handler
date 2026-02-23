import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  GestureEvent,
  SingleGesture,
} from '../../../types';

export type RotationGestureNativeProperties = Record<string, never>;

// We want to keep `{}` because it does not break ts-server suggestions
// eslint-disable-next-line @typescript-eslint/ban-types
export type RotationHandlerData = {};

export type RotationExtendedHandlerData = {
  rotation: number;
  velocity: number;
  anchorX: number;
  anchorY: number;
  rotationChange: number;
};

export type RotationGestureProperties = RotationGestureNativeProperties;

export type RotationGestureInternalConfig = BaseGestureConfig<
  RotationGestureProperties,
  RotationHandlerData,
  RotationExtendedHandlerData
>;

export type RotationGestureConfig =
  ExcludeInternalConfigProps<RotationGestureInternalConfig>;

export type RotationGestureEvent = GestureEvent<RotationHandlerData>;
export type RotationGestureActiveEvent =
  GestureEvent<RotationExtendedHandlerData>;

export type RotationGesture = SingleGesture<
  RotationGestureProperties,
  RotationHandlerData,
  RotationExtendedHandlerData
>;
