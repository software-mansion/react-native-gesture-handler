import { NativeDetectorProps } from './common';
import { BaseGesture } from '../../handlers/gestures/gesture';
import { NativeDetector } from './NativeDetector';
import { ComposedGesture } from '../../handlers/gestures/gestureComposition';
import {
  GestureDetectorProps as LegacyGestureDetectorProps,
  GestureDetector as LegacyGestureDetector,
} from '../../handlers/gestures/GestureDetector';
export function GestureDetector<THandlerData, TConfig>(
  props: NativeDetectorProps<THandlerData, TConfig> | LegacyGestureDetectorProps
) {
  return props.gesture instanceof ComposedGesture ||
    props.gesture instanceof BaseGesture ? (
    <LegacyGestureDetector {...(props as LegacyGestureDetectorProps)} />
  ) : (
    <NativeDetector
      {...(props as NativeDetectorProps<THandlerData, TConfig>)}
    />
  );
}
