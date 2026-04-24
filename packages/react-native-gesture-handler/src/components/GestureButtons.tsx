import * as React from 'react';
import type { HostComponent } from 'react-native';
import { Animated, Platform, StyleSheet } from 'react-native';

import createNativeWrapper from '../handlers/createNativeWrapper';
import type {
  GestureEvent,
  HandlerStateChangeEvent,
} from '../handlers/gestureHandlerCommon';
import type { NativeViewGestureHandlerPayload } from '../handlers/GestureHandlerEventPayload';
import { State } from '../State';
import type {
  BaseButtonWithRefProps,
  BorderlessButtonWithRefProps,
  LegacyBaseButtonProps,
  LegacyBorderlessButtonProps,
  LegacyRawButtonProps,
  LegacyRectButtonProps,
  RectButtonWithRefProps,
} from './GestureButtonsProps';
import GestureHandlerButton from './GestureHandlerButton';

/**
 * @deprecated use `RawButton` instead
 */
export const LegacyRawButton = createNativeWrapper<LegacyRawButtonProps>(
  GestureHandlerButton as unknown as HostComponent<LegacyRawButtonProps>,
  {
    shouldCancelWhenOutside: false,
    shouldActivateOnStart: Platform.OS === 'web',
  }
);

class InnerBaseButton extends React.Component<BaseButtonWithRefProps> {
  static defaultProps = {
    delayLongPress: 600,
  };

  private lastActive: boolean;
  private longPressTimeout: ReturnType<typeof setTimeout> | undefined;
  private longPressDetected: boolean;

  constructor(props: BaseButtonWithRefProps) {
    super(props);
    this.lastActive = false;
    this.longPressDetected = false;
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
      !this.longPressDetected &&
      oldState === State.ACTIVE &&
      state !== State.CANCELLED &&
      this.lastActive &&
      this.props.onPress
    ) {
      this.props.onPress(pointerInside);
    }

    if (!this.lastActive && state === State.BEGAN && pointerInside) {
      this.longPressDetected = false;
      if (this.props.onLongPress) {
        this.longPressTimeout = setTimeout(
          this.onLongPress,
          this.props.delayLongPress
        );
      }
    } else if (
      // Cancel longpress timeout if it's set and the finger moved out of the view
      state === State.ACTIVE &&
      !pointerInside &&
      this.longPressTimeout !== undefined
    ) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = undefined;
    } else if (
      // Cancel longpress timeout if it's set and the gesture has finished
      this.longPressTimeout !== undefined &&
      (state === State.END ||
        state === State.CANCELLED ||
        state === State.FAILED)
    ) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = undefined;
    }

    this.lastActive = active;
  };

  private onLongPress = () => {
    this.longPressDetected = true;
    this.props.onLongPress?.();
  };

  // Normally, the parent would execute it's handler first, then forward the
  // event to listeners. However, here our handler is virtually only forwarding
  // events to listeners, so we reverse the order to keep the proper order of
  // the callbacks (from "raw" ones to "processed").
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

  override render() {
    const { rippleColor, style, ...rest } = this.props;

    return (
      <LegacyRawButton
        ref={this.props.innerRef}
        rippleColor={rippleColor}
        style={[style, Platform.OS === 'ios' && { cursor: undefined }]}
        {...rest}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}
      />
    );
  }
}

const AnimatedInnerBaseButton =
  Animated.createAnimatedComponent<typeof InnerBaseButton>(InnerBaseButton);

/**
 * @deprecated use `BaseButton` instead
 */
export const LegacyBaseButton = ({
  ref,
  ...props
}: Omit<LegacyBaseButtonProps, 'innerRef'> & {
  ref?: React.Ref<React.ComponentType<any>> | undefined;
}) => <InnerBaseButton innerRef={ref} {...props} />;

const AnimatedBaseButton = ({
  ref,
  ...props
}: Animated.AnimatedProps<BaseButtonWithRefProps> & {
  ref?: React.Ref<React.ComponentType<any>> | undefined;
}) => <AnimatedInnerBaseButton innerRef={ref} {...props} />;

const btnStyles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});

class InnerRectButton extends React.Component<RectButtonWithRefProps> {
  static defaultProps = {
    activeOpacity: 0.105,
    underlayColor: 'black',
  };

  private opacity: Animated.Value;

  constructor(props: RectButtonWithRefProps) {
    super(props);
    this.opacity = new Animated.Value(0);
  }

  private onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      this.opacity.setValue(active ? this.props.activeOpacity! : 0);
    }

    this.props.onActiveStateChange?.(active);
  };

  override render() {
    // Move activeOpacity out of the rest props to avoid passing it to the native component
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, style, activeOpacity, ...rest } = this.props;

    const resolvedStyle = StyleSheet.flatten(style) ?? {};

    return (
      <LegacyBaseButton
        {...rest}
        ref={this.props.innerRef}
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
      </LegacyBaseButton>
    );
  }
}

/**
 * @deprecated use `RectButton` instead
 */
export const LegacyRectButton = ({
  ref,
  ...props
}: Omit<LegacyRectButtonProps, 'innerRef'> & {
  ref?: React.Ref<React.ComponentType<any>> | undefined;
}) => <InnerRectButton innerRef={ref} {...props} />;

class InnerBorderlessButton extends React.Component<BorderlessButtonWithRefProps> {
  static defaultProps = {
    activeOpacity: 0.3,
    borderless: true,
  };

  private opacity: Animated.Value;

  constructor(props: BorderlessButtonWithRefProps) {
    super(props);
    this.opacity = new Animated.Value(1);
  }

  private onActiveStateChange = (active: boolean) => {
    if (Platform.OS !== 'android') {
      this.opacity.setValue(active ? this.props.activeOpacity! : 1);
    }

    this.props.onActiveStateChange?.(active);
  };

  override render() {
    // Move activeOpacity out of the rest props to avoid passing it to the native component
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, style, innerRef, activeOpacity, ...rest } = this.props;

    return (
      <AnimatedBaseButton
        {...rest}
        innerRef={innerRef}
        onActiveStateChange={this.onActiveStateChange}
        style={[style, Platform.OS === 'ios' && { opacity: this.opacity }]}>
        {children}
      </AnimatedBaseButton>
    );
  }
}

/**
 * @deprecated use `BorderlessButton` instead
 */
export const LegacyBorderlessButton = ({
  ref,
  ...props
}: Omit<LegacyBorderlessButtonProps, 'innerRef'> & {
  ref?: React.Ref<React.ComponentType<any>> | undefined;
}) => <InnerBorderlessButton innerRef={ref} {...props} />;

export { default as LegacyPureNativeButton } from './GestureHandlerButton';
