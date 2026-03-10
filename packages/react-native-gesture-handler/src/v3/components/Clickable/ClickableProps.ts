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
   * Background color of underlay. Works only when `animationTarget` is set to `UNDERLAY`.
   */
  underlayColor?: string | undefined;

  /**
   * Opacity applied to the underlay or button when it is in an active state.
   * If not provided, no visual feedback will be applied.
   */
  activeOpacity?: number | undefined;

  /**
   * Initial opacity of the underlay or button.
   */
  initialOpacity?: number | undefined;

  /**
   * Determines whether opacity should increase or decrease when the button is active.
   */
  opacityMode?: ClickableOpacityMode | undefined;

  /**
   * Determines what should be animated.
   * - 'underlay': an additional view rendered behind children.
   * - 'component': the whole button.
   */
  animationTarget?: ClickableAnimationTarget | undefined;

  /**
   * Configuration for the ripple effect on Android.
   */
  androidRipple?: PressableAndroidRippleConfig | undefined;
}
