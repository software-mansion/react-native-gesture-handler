import React from 'react';
import { Gesture } from '../types';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';

export interface NativeDetectorProps<THandlerData, TConfig> {
  children?: React.ReactNode;
  gesture: Gesture<THandlerData, TConfig>;
}

export const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

export const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);

export const nativeDetectorStyles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
