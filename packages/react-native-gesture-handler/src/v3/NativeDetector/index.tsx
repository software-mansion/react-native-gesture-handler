import React from 'react';
import { NativeGesture } from '../hooks/useGesture';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';

import { AnimatedNativeDetector } from './AnimatedNativeDetector';
import { ReanimatedNativeDetector } from './ReanimatedNativeDetector';
import { BasicNativeDetector } from './BasicNativeDetector';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  if (gesture.dispatchesAnimatedEvents) {
    return (
      <AnimatedNativeDetector gesture={gesture}>
        {children}
      </AnimatedNativeDetector>
    );
  }

  if (Reanimated !== undefined && gesture.shouldUseReanimated) {
    return (
      <ReanimatedNativeDetector gesture={gesture}>
        {children}
      </ReanimatedNativeDetector>
    );
  }

  return (
    <BasicNativeDetector gesture={gesture}>{children}</BasicNativeDetector>
  );
}
