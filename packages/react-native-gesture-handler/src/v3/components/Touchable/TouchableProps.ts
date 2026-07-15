import type { AnimationDuration } from '@swmansion/gesture-handler-core/src/v3/press/TouchableTypes';
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

type DurationProps =
  | 'tapAnimationInDuration'
  | 'tapAnimationOutDuration'
  | 'longPressDuration'
  | 'longPressAnimationOutDuration'
  | 'hoverAnimationInDuration'
  | 'hoverAnimationOutDuration';

// The timing configuration is core's contract now (the Touchable lives in
// core's v3/press); re-exported here for backwards compatibility.
export type { AnimationDuration } from '@swmansion/gesture-handler-core/src/v3/press/TouchableTypes';

export type TouchableProps = Omit<
  ButtonProps,
  RippleProps | 'enabled' | DurationProps
> &
  Omit<
    BaseButtonProps,
    keyof RawButtonProps | 'onActiveStateChange' | 'onPress'
  > & {
    /**
     * Press and hover animation durations, in milliseconds. Pass a single
     * number to apply it to every phase, or an object to customize per phase
     * and per category. Defaults to 50ms for the in phase and 100ms for the
     * out phase.
     */
    animationDuration?: AnimationDuration | undefined;
    /**
     * Configuration for the ripple effect on Android.
     */
    androidRipple?: PressableAndroidRippleConfig | undefined;

    /**
     * Called when the component gets pressed.
     */
    onPress?: ((event: CallbackEventType) => void) | undefined;

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

    /**
     * Whether the touch should be canceled when pointer leaves the component. By default set to true.
     * On web this prop doesn't have any effect and behaves as if `true` was set.
     */
    cancelOnLeave?: boolean | undefined;
  };
