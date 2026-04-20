import type { PressableAndroidRippleConfig as RNPressableAndroidRippleConfig } from 'react-native';

import type { ButtonProps } from '../../../components/GestureHandlerButton';
import type { NativeHandlerData } from '../../hooks/gestures/native/NativeTypes';
import type { GestureEndEvent, GestureEvent } from '../../types';
import type { BaseButtonProps, RawButtonProps } from '../GestureButtonsProps';

export type CallbackEventType = GestureEvent<NativeHandlerData>;
export type EndCallbackEventType = GestureEndEvent<NativeHandlerData>;

type PressableAndroidRippleConfig = {
  [K in keyof RNPressableAndroidRippleConfig]?: Exclude<
    RNPressableAndroidRippleConfig[K],
    null
  >;
};

type RippleProps = 'rippleColor' | 'rippleRadius' | 'borderless' | 'foreground';

export type TouchableProps = Omit<ButtonProps, RippleProps | 'enabled'> &
  Omit<BaseButtonProps, keyof RawButtonProps> & {
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

    /**
     * Whether the component should ignore touches. By default set to false.
     */
    disabled?: boolean | undefined;
  };
