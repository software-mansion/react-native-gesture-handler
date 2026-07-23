import type { PressableAndroidRippleConfig as RNPressableAndroidRippleConfig } from 'react-native';

import type {
  ButtonEvent,
  ButtonProps,
} from '../../../components/GestureHandlerButton';
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

// The press events are redeclared below with the unwrapped `ButtonEvent`
// signature; `onInteractionFinished` is consumed internally by `Touchable`.
type PressProps =
  | 'onPress'
  | 'onPressIn'
  | 'onPressOut'
  | 'onLongPress'
  | 'onInteractionFinished';

type DurationProps =
  | 'tapAnimationInDuration'
  | 'tapAnimationOutDuration'
  | 'longPressDuration'
  | 'longPressAnimationOutDuration'
  | 'hoverAnimationInDuration'
  | 'hoverAnimationOutDuration';

type InOutDuration = { in: number; out: number };
type LongPressDuration = { out: number };

/**
 * Configuration for press / hover animation timing.
 *
 * - A single number applies to every phase of every category.
 * - An object with top-level `in` / `out` sets the baseline; `tap` and
 *   `hover` may override either side or both — any field left out
 *   inherits the top-level value.
 * - Alternatively, both categories may be specified in full without a
 *   top-level baseline.
 *
 * `longPress` optionally customizes the press-out duration once the
 * press has been held past `delayLongPress`. If omitted, the long-press
 * release falls back to the resolved tap-out timing.
 */
export type AnimationDuration =
  | number
  | (InOutDuration & {
      tap?: Partial<InOutDuration>;
      hover?: Partial<InOutDuration>;
      longPress?: LongPressDuration;
    })
  | {
      tap: InOutDuration;
      hover: InOutDuration;
      longPress?: LongPressDuration;
    };

export type TouchableProps = Omit<
  ButtonProps,
  RippleProps | PressProps | 'enabled' | DurationProps
> &
  Omit<
    BaseButtonProps,
    keyof RawButtonProps | 'onActiveStateChange' | 'onPress' | 'onLongPress'
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
    onPress?: ((event: ButtonEvent) => void) | undefined;

    /**
     * Called when the component gets long pressed.
     */
    onLongPress?: ((event: ButtonEvent) => void) | undefined;

    /**
     * Called when pointer touches the component.
     */
    onPressIn?: ((event: ButtonEvent) => void) | undefined;

    /**
     * Called when pointer is released from the component.
     */
    onPressOut?: ((event: ButtonEvent) => void) | undefined;

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
