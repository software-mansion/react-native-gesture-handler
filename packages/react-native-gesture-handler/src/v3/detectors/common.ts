import React from 'react';
import { Gesture } from '../types';
import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { GestureDetectorProps as LegacyDetectorProps } from '../../handlers/gestures/GestureDetector';

export interface NativeDetectorProps<THandlerData, TConfig> {
  children?: React.ReactNode;
  gesture: Gesture<THandlerData, TConfig>;
}

export interface InterceptingGestureDetectorProps<THandlerData, TConfig> {
  children?: React.ReactNode;
  gesture?: Gesture<THandlerData, TConfig>;
}

export type GestureDetectorProps<THandlerData, TConfig> =
  | NativeDetectorProps<THandlerData, TConfig>
  | InterceptingGestureDetectorProps<THandlerData, TConfig>
  | LegacyDetectorProps;

export const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

export const nativeDetectorStyles = StyleSheet.create({
  detector: {
    display: 'contents',
  },
});
