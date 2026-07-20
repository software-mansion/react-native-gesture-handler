import type {
  BaseGestureConfig,
  SingleGestureName,
} from '@swmansion/gesture-handler-core';
import { useGesture as useGestureImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/useGesture';

import { runtime } from './runtime';

export function useGesture<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData = THandlerData,
>(
  type: SingleGestureName,
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
) {
  return useGestureImpl<TConfig, THandlerData, TExtendedHandlerData>(
    runtime,
    type,
    config
  );
}
