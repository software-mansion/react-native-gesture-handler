import { NativeDetectorProps } from './common';
import { BaseGesture } from '../../handlers/gestures/gesture';
import { NativeDetector } from './NativeDetector';
import { ComposedGesture } from '../../handlers/gestures/gestureComposition';
import {
  GestureDetectorProps as LegacyGestureDetectorProps,
  GestureDetector as LegacyGestureDetector,
} from '../../handlers/gestures/GestureDetector';
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
