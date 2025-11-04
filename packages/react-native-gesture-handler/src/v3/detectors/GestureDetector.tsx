import { NativeDetectorProps } from './common';
import { BaseGesture } from '../../handlers/gestures/gesture';
import { NativeDetector } from './NativeDetector';
import { ComposedGesture } from '../../handlers/gestures/gestureComposition';
import {
  GestureDetectorProps as LegacyGestureDetectorProps,
  GestureDetector as LegacyGestureDetector,
} from '../../handlers/gestures/GestureDetector';
import { DetectorContext } from './VirtualDetector/useDetectorContext';
import { VirtualDetector } from './VirtualDetector/VirtualDetector';
import { use } from 'react';

export function GestureDetector<THandlerData, TConfig>(
  props: NativeDetectorProps<THandlerData, TConfig> | LegacyGestureDetectorProps
) {
  if (
    props.gesture instanceof ComposedGesture ||
    props.gesture instanceof BaseGesture
  ) {
    return <LegacyGestureDetector {...(props as LegacyGestureDetectorProps)} />;
  }

  const context = use(DetectorContext);
  return context ? (
    <VirtualDetector
      {...(props as NativeDetectorProps<THandlerData, TConfig>)}
    />
  ) : (
    <NativeDetector
      {...(props as NativeDetectorProps<THandlerData, TConfig>)}
    />
  );
}
