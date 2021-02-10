import * as React from 'react';
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
import { State } from '../State';

import {
  GestureEvent,
  HandlerStateChangeEvent,
} from '../handlers/gestureHandlers';
import {
  NativeViewGestureHandlerPayload,
  NativeViewGestureHandlerProps,
} from '../handlers/NativeViewGestureHandler';

export interface RawButtonProps extends NativeViewGestureHandlerProps {
  exclusive?: boolean;
  // TODO: we should transform props in `createNativeWrapper`
  rippleColor?: any; // it was present in BaseButtonProps before but is used here in code
}

export interface BaseButtonProps extends RawButtonProps {
  onPress?: (pointerInside: boolean) => void;
  onActiveStateChange?: (active: boolean) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface RectButtonProps extends BaseButtonProps {
  underlayColor?: string;
  activeOpacity?: number;
}

export interface BorderlessButtonProps extends BaseButtonProps {
  borderless?: boolean;
  activeOpacity?: number;
}

export const RawButton = createNativeWrapper(GestureHandlerButton, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: false,
});

export class BaseButton extends React.Component<BaseButtonProps> {
  private lastActive: boolean;

  constructor(props: BaseButtonProps) {
    super(props);
    this.lastActive = false;
  }

  private handleEvent = ({
    nativeEvent,
  }: HandlerStateChangeEvent<NativeViewGestureHandlerPayload>) => {
    const { state, oldState, pointerInside } = nativeEvent;
    const active = pointerInside && state === State.ACTIVE;

    if (active !== this.lastActive && this.props.onActiveStateChange) {
      this.props.onActiveStateChange(active);
    }

    if (
      oldState === State.ACTIVE &&
      state !== State.CANCELLED &&
      this.lastActive &&
      this.props.onPress
    ) {
      this.props.onPress(active);
    }

    this.lastActive = active;
  };

  // Normally, the parent would execute it's handler first,
  // then forward the event to listeners. However, here our handler
  // is virtually only forwarding events to listeners, so we reverse the order
  // to keep the proper order of the callbacks (from "raw" ones to "processed").
  private onHandlerStateChange = (
    e: HandlerStateChangeEvent<NativeViewGestureHandlerPayload>
  ) => {
    this.props.onHandlerStateChange?.(e);
    this.handleEvent(e);
  };

  private onGestureEvent = (
    e: GestureEvent<NativeViewGestureHandlerPayload>
  ) => {
    this.props.onGestureEvent?.(e);
    this.handleEvent(
      e as HandlerStateChangeEvent<NativeViewGestureHandlerPayload>
    ); // TODO: maybe it is not correct
  };

  render() {
    const { rippleColor, ...rest } = this.props;

    return (
      <RawButton
        rippleColor={processColor(rippleColor)}
        {...rest}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}
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

export class RectButton extends React.Component<RectButtonProps> {
  static defaultProps = {
    activeOpacity: 0.105,
    underlayColor: 'black',
  };

  private opacity: Animated.Value;

  constructor(props: RectButtonProps) {
    super(props);
    this.opacity = new Animated.Value(0);
  }

  private onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      this.opacity.setValue(active ? this.props.activeOpacity! : 0);
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
        onActiveStateChange={this.onActiveStateChange}>
        <Animated.View
          style={[
            btnStyles.underlay,
            {
              opacity: this.opacity,
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

export class BorderlessButton extends React.Component<BorderlessButtonProps> {
  static defaultProps = {
    activeOpacity: 0.3,
    borderless: true,
  };

  private opacity: Animated.Value;

  constructor(props: BorderlessButtonProps) {
    super(props);
    this.opacity = new Animated.Value(1);
  }

  private onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      this.opacity.setValue(active ? this.props.activeOpacity! : 1);
    }

    this.props.onActiveStateChange?.(active);
  };

  render() {
    const { children, style, ...rest } = this.props;

    return (
      <AnimatedBaseButton
        {...rest}
        onActiveStateChange={this.onActiveStateChange}
        style={[style, Platform.OS === 'ios' && { opacity: this.opacity }]}>
        {children}
      </AnimatedBaseButton>
    );
  }
}

export { default as PureNativeButton } from './GestureHandlerButton';
