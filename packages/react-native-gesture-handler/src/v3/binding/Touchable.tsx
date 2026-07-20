import { Touchable as TouchableImpl } from '@swmansion/gesture-handler-core/src/v3/press/Touchable';
import type {
  CoreTouchableProps,
  TouchablePressKit,
} from '@swmansion/gesture-handler-core/src/v3/press/TouchableTypes';
import type { PressableAndroidRippleConfig } from 'react-native';
import { Platform } from 'react-native';

import GestureHandlerButton from '../../components/GestureHandlerButton';
import { getTVProps } from '../../components/utils';
import { runtime } from './runtime';

const IS_ANDROID = Platform.OS === 'android';
const TRANSPARENT_RIPPLE = { rippleColor: 'transparent' as const };

// The press kit lives HERE, next to the component, rather than on the
// platform port. It owns the react-native-only prop translation the core
// Touchable cannot know about: the Android ripple config and TV
// focusability.
const press: TouchablePressKit = {
  Button: GestureHandlerButton,
  mapButtonProps: (rest: Record<string, unknown>) => {
    const { androidRipple, ...hostProps } = rest as {
      androidRipple?: PressableAndroidRippleConfig;
      focusable?: boolean;
      isTVSelectable?: boolean;
    } & Record<string, unknown>;

    const rippleProps =
      IS_ANDROID && androidRipple !== undefined
        ? {
            rippleColor: androidRipple.color,
            rippleRadius: androidRipple.radius,
            borderless: androidRipple.borderless,
            foreground: androidRipple.foreground,
          }
        : TRANSPARENT_RIPPLE;

    return {
      ...hostProps,
      ...getTVProps(hostProps),
      ...rippleProps,
    };
  },
};

// The Touchable component itself lives in core (v3/press/Touchable); the
// public react-native prop type is overlaid at
// v3/components/Touchable/Touchable.tsx.
export function Touchable(props: CoreTouchableProps) {
  return TouchableImpl(runtime, press, props);
}
