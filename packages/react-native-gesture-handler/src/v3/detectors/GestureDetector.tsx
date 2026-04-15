import { BaseGesture } from '../../handlers/gestures/gesture';
import { ComposedGesture } from '../../handlers/gestures/gestureComposition';
import { GestureDetector as LegacyGestureDetector } from '../../handlers/gestures/GestureDetector';
import type { GestureDetectorProps as LegacyGestureDetectorProps } from '../../handlers/gestures/GestureDetector';
import { NativeDetector } from './NativeDetector';
import type { NativeDetectorProps } from './common';
import { useEnsureGestureHandlerRootView } from './useEnsureGestureHandlerRootView';

export function GestureDetector<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  props:
    | NativeDetectorProps<TConfig, THandlerData, TExtendedHandlerData>
    | LegacyGestureDetectorProps
) {
  useEnsureGestureHandlerRootView();

  if (
    props.gesture instanceof ComposedGesture ||
    props.gesture instanceof BaseGesture
  ) {
    return <LegacyGestureDetector {...(props as LegacyGestureDetectorProps)} />;
  }

  return (
    <NativeDetector
      {...(props as NativeDetectorProps<
        TConfig,
        THandlerData,
        TExtendedHandlerData
      >)}
    />
  );
}
