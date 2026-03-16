import type { PressableAndroidRippleConfig as RNPressableAndroidRippleConfig } from 'react-native';
import type { BaseButtonProps } from '../GestureButtonsProps';
import type { GestureEvent } from '../../types';
import type { NativeHandlerData } from '../../hooks/gestures/native/NativeTypes';

export type CallbackEventType = GestureEvent<NativeHandlerData>;

type PressableAndroidRippleConfig = {
  [K in keyof RNPressableAndroidRippleConfig]?: Exclude<
    RNPressableAndroidRippleConfig[K],
    null
  >;
};

type RippleProps = 'rippleColor' | 'rippleRadius' | 'borderless' | 'foreground';

export interface ClickableProps extends Omit<BaseButtonProps, RippleProps> {
  /**
   * Background color of underlay. Requires `underlayActiveOpacity` to be set.
   */
  underlayColor?: string | undefined;

  /**
   * Opacity applied to the underlay when it is in an active state.
   * If not provided, no visual feedback will be applied.
   */
  underlayActiveOpacity?: number | undefined;

  /**
   * Opacity applied to the component when it is in an active state.
   * If not provided, no visual feedback will be applied.
   */
  activeOpacity?: number | undefined;

  /**
   * Initial opacity of the underlay.
   */
  underlayInitialOpacity?: number | undefined;

  /**
   * Initial opacity of the component.
   */
  initialOpacity?: number | undefined;

  /**
   * Configuration for the ripple effect on Android.
   */
  androidRipple?: PressableAndroidRippleConfig | undefined;

  /**
   * Called when pointer touches the component.
   */
  onPressIn?: ((event: CallbackEventType) => void) | undefined;

  /**
   * Called when pointer is released from the component.
   */
  onPressOut?: ((event: CallbackEventType) => void) | undefined;
}
