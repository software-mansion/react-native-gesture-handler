import React from 'react';
import {
  Animated,
  Platform,
  processColor,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import createNativeWrapper from '../handlers/createNativeWrapper';
import GestureHandlerButton from './GestureHandlerButton';
import State from '../State';

import {
  NativeViewGestureHandlerProperties,
  NativeViewGestureHandlerStateChangeEvent,
} from '../types';

/* BUTTONS PROPERTIES */

interface RawButtonProperties extends NativeViewGestureHandlerProperties {
  exclusive?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

interface BaseButtonProperties extends RawButtonProperties {
  onPress?: (pointerInside: boolean) => void;
  onActiveStateChange?: (active: boolean) => void;
  style?: StyleProp<ViewStyle>;
  rippleColor?: string;
}

interface RectButtonProperties extends BaseButtonProperties {
  underlayColor?: string;
  activeOpacity?: number;
}

interface BorderlessButtonProperties extends BaseButtonProperties {
  borderless?: boolean;
  activeOpacity?: number;
}

export const RawButton: React.Component<RawButtonProperties> = createNativeWrapper(
  GestureHandlerButton,
  {
    shouldCancelWhenOutside: false,
    shouldActivateOnStart: false,
  }
);

export class BaseButton extends React.Component<BaseButtonProperties> {
  constructor(props: BaseButtonProperties) {
    super(props);
    this._lastActive = false;
  }

  private _lastActive: boolean;

  _handleEvent = ({
    nativeEvent,
  }: NativeViewGestureHandlerStateChangeEvent) => {
    const { state, oldState, pointerInside } = nativeEvent;
    const active = pointerInside && state === State.ACTIVE;

    if (active !== this._lastActive && this.props.onActiveStateChange) {
      this.props.onActiveStateChange(active);
    }

    if (
      oldState === State.ACTIVE &&
      state !== State.CANCELLED &&
      this._lastActive &&
      this.props.onPress
    ) {
      this.props.onPress(active);
    }

    this._lastActive = active;
  };

  // Normally, the parent would execute it's handler first,
  // then forward the event to listeners. However, here our handler
  // is virtually only forwarding events to listeners, so we reverse the order
  // to keep the proper order of the callbacks (from "raw" ones to "processed").
  _onHandlerStateChange = (e: NativeViewGestureHandlerStateChangeEvent) => {
    this.props.onHandlerStateChange?.(e);
    this._handleEvent(e);
  };

  _onGestureEvent = (e: NativeViewGestureHandlerStateChangeEvent) => {
    this.props.onGestureEvent?.(e);
    this._handleEvent(e);
  };

  render() {
    const { rippleColor, ...rest } = this.props;

    return (
      <RawButton
        rippleColor={processColor(rippleColor)}
        {...rest}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}
      />
    );
  }
}

const AnimatedBaseButton = Animated.createAnimatedComponent(BaseButton);

const btnStyles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});

export class RectButton extends React.Component<RectButtonProperties> {
  static defaultProps = {
    activeOpacity: 0.105,
    underlayColor: 'black',
  };

  constructor(props: RectButtonProperties) {
    super(props);
    this._opacity = new Animated.Value(0);
  }

  private _opacity: Animated.Value;

  _onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      this._opacity.setValue(active ? this.props.activeOpacity! : 0);
    }

    this.props.onActiveStateChange?.(active);
  };

  render() {
    const { children, style, ...rest } = this.props;

    const resolvedStyle = StyleSheet.flatten(style ?? {});

    return (
      <BaseButton
        {...rest}
        style={resolvedStyle}
        onActiveStateChange={this._onActiveStateChange}>
        <Animated.View
          style={[
            btnStyles.underlay,
            {
              opacity: this._opacity,
              backgroundColor: this.props.underlayColor,
              borderRadius: resolvedStyle.borderRadius,
              borderTopLeftRadius: resolvedStyle.borderTopLeftRadius,
              borderTopRightRadius: resolvedStyle.borderTopRightRadius,
              borderBottomLeftRadius: resolvedStyle.borderBottomLeftRadius,
              borderBottomRightRadius: resolvedStyle.borderBottomRightRadius,
            },
          ]}
        />
        {children}
      </BaseButton>
    );
  }
}

export class BorderlessButton extends React.Component<
  BorderlessButtonProperties
> {
  static defaultProps = {
    activeOpacity: 0.3,
    borderless: true,
  };

  constructor(props: BorderlessButtonProperties) {
    super(props);
    this._opacity = new Animated.Value(1);
  }

  private _opacity: Animated.Value;

  _onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      this._opacity.setValue(active ? this.props.activeOpacity! : 1);
    }

    this.props.onActiveStateChange?.(active);
  };

  render() {
    const { children, style, ...rest } = this.props;

    return (
      <AnimatedBaseButton
        {...rest}
        onActiveStateChange={this._onActiveStateChange}
        style={[style, Platform.OS === 'ios' && { opacity: this._opacity }]}>
        {children}
      </AnimatedBaseButton>
    );
  }
}

export { default as PureNativeButton } from './GestureHandlerButton';
