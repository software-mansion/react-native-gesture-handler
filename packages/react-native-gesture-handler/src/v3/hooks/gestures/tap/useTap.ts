import {
  BaseDiscreteGestureConfig,
  ExcludeInternalConfigProps,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  DiscreteSingleGesture,
  SingleGestureName,
  WithSharedValue,
} from '../../../types';
import { useGesture } from '../../useGesture';
import { cloneConfig, remapProps } from '../../utils';
import {
  TapGestureExternalConfig,
  TapGestureNativeConfig,
} from './TapProperties';

type TapHandlerData = {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

type TapGestureProperties = WithSharedValue<TapGestureExternalConfig>;

type TapGestureInternalProperties = WithSharedValue<TapGestureNativeConfig>;

export type TapGestureConfig = ExcludeInternalConfigProps<
  BaseDiscreteGestureConfig<TapHandlerData, TapGestureProperties>
>;

type TapGestureInternalConfig = BaseDiscreteGestureConfig<
  TapHandlerData,
  TapGestureInternalProperties
>;

export type TapGestureStateChangeEvent =
  GestureStateChangeEvent<TapHandlerData>;

export type TapGestureUpdateEvent = GestureUpdateEvent<TapHandlerData>;

export type TapGesture = DiscreteSingleGesture<
  TapHandlerData,
  TapGestureProperties
>;

const TapPropsMapping = new Map<
  keyof TapGestureProperties,
  keyof TapGestureInternalProperties
>([
  ['maxDistance', 'maxDist'],
  ['maxDuration', 'maxDurationMs'],
  ['maxDelay', 'maxDelayMs'],
]);

export function useTap(config: TapGestureConfig): TapGesture {
  const tapConfig = cloneConfig<TapHandlerData, TapGestureInternalProperties>(
    config
  );

  remapProps<TapGestureConfig, TapGestureInternalConfig>(
    tapConfig,
    TapPropsMapping
  );

  return useGesture<TapHandlerData, TapGestureInternalProperties>(
    SingleGestureName.Tap,
    tapConfig
  );
}
