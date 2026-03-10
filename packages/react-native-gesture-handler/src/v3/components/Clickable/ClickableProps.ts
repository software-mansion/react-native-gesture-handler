import type { PressableAndroidRippleConfig as RNPressableAndroidRippleConfig } from 'react-native';
import type { BaseButtonProps } from '../GestureButtonsProps';
import type { GestureEvent } from '../../types';
import type { NativeHandlerData } from '../../hooks/gestures/native/NativeTypes';

export type CallbackEventType = GestureEvent<NativeHandlerData>;

export enum ClickableOpacityMode {
  INCREASE,
  DECREASE,
}

export enum ClickableAnimationTarget {
  COMPONENT,
  UNDERLAY,
}

type PressableAndroidRippleConfig = {
  [K in keyof RNPressableAndroidRippleConfig]?: Exclude<
    RNPressableAndroidRippleConfig[K],
    null
  >;
};

type RippleProps = 'rippleColor' | 'rippleRadius' | 'borderless' | 'foreground';

export interface ClickableProps extends Omit<BaseButtonProps, RippleProps> {
  /**
   * Background color that will be dimmed when button is in active state.
   */
  underlayColor?: string | undefined;

  /**
   * Opacity applied to the underlay or button when it is in an active state.
   * If not provided, no visual feedback will be applied.
   */
  activeOpacity?: number | undefined;

  /**
   * Determines the direction of the animation.
   * - 'opacity-increase' (default): opacity goes from 0 to activeOpacity.
   * - 'opacity-decrease': opacity goes from 1 to activeOpacity.
   */
  opacityMode?: ClickableOpacityMode | undefined;

  /**
   * Determines what should be animated.
   * - 'underlay' (default): an additional view rendered behind children.
   * - 'component': the whole button.
   */
  animationTarget?: ClickableAnimationTarget | undefined;

  /**
   * Configuration for ripple effect on Android.
   */
  androidRipple?: PressableAndroidRippleConfig | undefined;
}
