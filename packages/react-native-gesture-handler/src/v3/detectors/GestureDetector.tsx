import { NativeDetectorProps } from './common';
import { BaseGesture } from '../../handlers/gestures/gesture';
import { NativeDetector } from './NativeDetector';
import { ComposedGesture } from '../../handlers/gestures/gestureComposition';
import {
  GestureDetectorProps as LegacyGestureDetectorProps,
  GestureDetector as LegacyGestureDetector,
} from '../../handlers/gestures/GestureDetector';
import { useDetectorContext } from './LogicDetector/useDetectorContext';
import { LogicDetector } from './LogicDetector/LogicDetector';
export function GestureDetector<THandlerData, TConfig>(
  props: NativeDetectorProps<THandlerData, TConfig> | LegacyGestureDetectorProps
) {
  const context = useDetectorContext();
  return props.gesture instanceof ComposedGesture ||
    props.gesture instanceof BaseGesture ? (
    <LegacyGestureDetector {...(props as LegacyGestureDetectorProps)} />
  ) : context ? (
    <LogicDetector {...(props as NativeDetectorProps<THandlerData, TConfig>)} />
  ) : (
    <NativeDetector
      {...(props as NativeDetectorProps<THandlerData, TConfig>)}
    />
  );
}
