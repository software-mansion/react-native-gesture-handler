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
import { useClonedAndRemappedConfig } from '../../utils';
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

export type TapGestureStateChangeEvent =
  GestureStateChangeEvent<TapHandlerData>;

export type TapGestureUpdateEvent = GestureUpdateEvent<TapHandlerData>;

export type TapGesture = DiscreteSingleGesture<
  TapHandlerData,
  TapGestureInternalProperties
>;

const TapPropsMapping = new Map<
  keyof TapGestureProperties,
  keyof TapGestureInternalProperties
>([
  ['maxDistance', 'maxDist'],
  ['maxDuration', 'maxDurationMs'],
  ['maxDelay', 'maxDelayMs'],
]);

export function useTapGesture(config: TapGestureConfig): TapGesture {
  const tapConfig = useClonedAndRemappedConfig<
    TapHandlerData,
    TapGestureProperties,
    TapGestureInternalProperties
  >(config, TapPropsMapping);

  return useGesture<TapHandlerData, TapGestureInternalProperties>(
    SingleGestureName.Tap,
    tapConfig
  );
}
