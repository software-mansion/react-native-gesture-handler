import React from 'react';
import { Gesture } from '../types';
import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { GestureDetectorProps as LegacyDetectorProps } from '../../handlers/gestures/GestureDetector';
import { TouchAction, UserSelect } from '../../handlers/gestureHandlerCommon';

export enum GestureDetectorType {
  Native,
  Virtual,
  Intercepting,
}

interface CommonGestureDetectorProps {
  children?: React.ReactNode;
  userSelect?: UserSelect;
  touchAction?: TouchAction;
  enableContextMenu?: boolean;
}

export interface NativeDetectorProps<THandlerData, TConfig>
  extends CommonGestureDetectorProps {
  gesture: Gesture<THandlerData, TConfig>;
}

export interface InterceptingGestureDetectorProps<THandlerData, TConfig>
  extends CommonGestureDetectorProps {
  gesture?: Gesture<THandlerData, TConfig>;
}

// TODO: Handle CommonGestureDetectorProps inside VirtualGestureDetector
export interface VirtualDetectorProps<THandlerData, TConfig>
  extends CommonGestureDetectorProps {
  children?: React.ReactNode;
  gesture: Gesture<THandlerData, TConfig>;
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
