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

export interface NativeDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> extends CommonGestureDetectorProps {
  gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>;
}

export interface InterceptingGestureDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> extends CommonGestureDetectorProps {
  gesture?: Gesture<TConfig, THandlerData, TExtendedHandlerData>;
}

// TODO: Handle CommonGestureDetectorProps inside VirtualGestureDetector
export interface VirtualDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> {
  children?: React.ReactNode;
  gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>;
}

export type GestureDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> =
  | NativeDetectorProps<TConfig, THandlerData, TExtendedHandlerData>
  | InterceptingGestureDetectorProps<
      TConfig,
      THandlerData,
      TExtendedHandlerData
    >
  | LegacyDetectorProps;

export const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

export const nativeDetectorStyles = StyleSheet.create({
  detector: {
    display: 'contents',
  },
});
