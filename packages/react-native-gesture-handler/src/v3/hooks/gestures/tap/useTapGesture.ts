import type {
  TapGesture,
  TapGestureConfig,
  TapGestureInternalProperties,
  TapGestureProperties,
  TapHandlerData,
} from './TapTypes';
import { SingleGestureName } from '../../../types';
import { useClonedAndRemappedConfig } from '../../utils';
import { useGesture } from '../../useGesture';

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
