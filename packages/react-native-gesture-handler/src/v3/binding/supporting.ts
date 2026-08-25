import type {
  BaseGestureConfig,
  Gesture,
} from '@swmansion/gesture-handler-core';
import { useEnsureGestureHandlerRootView as useEnsureGestureHandlerRootViewImpl } from '@swmansion/gesture-handler-core/src/v3/detectors/useEnsureGestureHandlerRootView';
import { useGestureRelationsUpdater as useGestureRelationsUpdaterImpl } from '@swmansion/gesture-handler-core/src/v3/detectors/useGestureRelationsUpdater';
import { useGestureCallbacks as useGestureCallbacksImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/useGestureCallbacks';
import { useJSResponderHandler as useJSResponderHandlerImpl } from '@swmansion/gesture-handler-core/src/v3/hooks/useJSResponderHandler';

import { runtime } from './runtime';

export function useEnsureGestureHandlerRootView() {
  return useEnsureGestureHandlerRootViewImpl(runtime);
}

export function useJSResponderHandler<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>) {
  return useJSResponderHandlerImpl(runtime, gesture);
}

export function useGestureRelationsUpdater<TConfig, THandlerData>(
  gesture?: Gesture<TConfig, THandlerData>
) {
  return useGestureRelationsUpdaterImpl(runtime, gesture);
}

export function useGestureCallbacks<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  handlerTag: number,
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
) {
  return useGestureCallbacksImpl(runtime, handlerTag, config);
}
