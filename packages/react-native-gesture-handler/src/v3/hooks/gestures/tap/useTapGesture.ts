import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import {
  TapGestureProperties,
  TapGestureInternalProperties,
  TapHandlerData,
  TapGestureConfig,
  TapGesture,
} from './TapTypes';

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
    TapGestureProperties,
    TapHandlerData,
    TapGestureInternalProperties
  >(config, TapPropsMapping);

  return useGesture<TapGestureInternalProperties, TapHandlerData>(
    SingleGestureName.Tap,
    tapConfig
  );
}
