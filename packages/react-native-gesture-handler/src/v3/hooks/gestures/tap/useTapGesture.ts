import { SingleGestureName } from '../../../types';
import { useGesture } from '../../useGesture';
import { useClonedAndRemappedConfig } from '../../utils';
import type {
  TapGesture,
  TapGestureConfig,
  TapGestureInternalProperties,
  TapGestureProperties,
  TapHandlerData,
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
