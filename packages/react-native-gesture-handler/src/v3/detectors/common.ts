import { Animated, StyleSheet } from 'react-native';
import type {
  TouchAction,
  UserSelect,
} from '../../handlers/gestureHandlerCommon';
import type { Gesture } from '../types';
import HostGestureDetector from './HostGestureDetector';
import type { GestureDetectorProps as LegacyDetectorProps } from '../../handlers/gestures/GestureDetector';
import type React from 'react';

export enum GestureDetectorType {
  Native,
  Virtual,
  Intercepting,
}

interface CommonGestureDetectorProps {
  children?: React.ReactNode;
  userSelect?: UserSelect | undefined;
  touchAction?: TouchAction | undefined;
  enableContextMenu?: boolean | undefined;
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

export interface VirtualDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> extends CommonGestureDetectorProps {
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
