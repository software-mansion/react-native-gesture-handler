// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us
// to move faster and fix possible issues quicker

import * as React from 'react';
import { Component } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  I18nManager,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

import {
  PanGestureHandler,
  TapGestureHandler,
  PanGestureHandlerProps,
  GestureEvent,
  PanGestureHandlerEventPayload,
  HandlerStateChangeEvent,
  TapGestureHandlerEventPayload,
} from '../handlers/gestureHandlers';
import { State } from '../State';

const DRAG_TOSS = 0.05;

type SwipeableExcludes = Exclude<
  keyof PanGestureHandlerProps,
  'onGestureEvent' | 'onHandlerStateChange'
>;

interface SwipeableProps
  extends Pick<PanGestureHandlerProps, SwipeableExcludes> {
  enableTrackpadTwoFingerGesture?: boolean;
  friction?: number;
  leftThreshold?: number;
  rightThreshold?: number;
  overshootLeft?: boolean;
  overshootRight?: boolean;
  overshootFriction?: number;
  onSwipeableLeftOpen?: () => void;
  onSwipeableRightOpen?: () => void;
  onSwipeableOpen?: () => void;
  onSwipeableClose?: () => void;
  onSwipeableLeftWillOpen?: () => void;
  onSwipeableRightWillOpen?: () => void;
  onSwipeableWillOpen?: () => void;
  onSwipeableWillClose?: () => void;
  /**
   *
   * This map describes the values to use as inputRange for extra interpolation:
   * AnimatedValue: [startValue, endValue]
   *
   * progressAnimatedValue: [0, 1]
   * dragAnimatedValue: [0, +]
   *
   * To support `rtl` flexbox layouts use `flexDirection` styling.
   * */
  renderLeftActions?: (
    progressAnimatedValue: Animated.AnimatedInterpolation,
    dragAnimatedValue: Animated.AnimatedInterpolation
  ) => React.ReactNode;
  /**
   *
   * This map describes the values to use as inputRange for extra interpolation:
   * AnimatedValue: [startValue, endValue]
   *
   * progressAnimatedValue: [0, 1]
   * dragAnimatedValue: [0, -]
   *
   * To support `rtl` flexbox layouts use `flexDirection` styling.
   * */
  renderRightActions?: (
    progressAnimatedValue: Animated.AnimatedInterpolation,
    dragAnimatedValue: Animated.AnimatedInterpolation
  ) => React.ReactNode;
  useNativeAnimations?: boolean;
  animationOptions?: Record<string, unknown>;
  containerStyle?: StyleProp<ViewStyle>;
  childrenContainerStyle?: StyleProp<ViewStyle>;
}

type SwipeableState = {
  dragX: Animated.Value;
  rowTranslation: Animated.Value;
  rowState: number;
  leftWidth?: number;
  rightOffset?: number;
  rowWidth?: number;
};

export default class Swipeable extends Component<
  SwipeableProps,
  SwipeableState
> {
  static defaultProps = {
    friction: 1,
    overshootFriction: 1,
    useNativeAnimations: true,
  };

  constructor(props: SwipeableProps) {
    super(props);
    const dragX = new Animated.Value(0);
    this.state = {
      dragX,
      rowTranslation: new Animated.Value(0),
      rowState: 0,
      leftWidth: undefined,
      rightOffset: undefined,
      rowWidth: undefined,
    };
    this.updateAnimatedEvent(props, this.state);

    this.onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: dragX } }],
      { useNativeDriver: props.useNativeAnimations! }
    );
  }

  UNSAFE_componentWillUpdate(props: SwipeableProps, state: SwipeableState) {
    if (
      this.props.friction !== props.friction ||
      this.props.overshootLeft !== props.overshootLeft ||
      this.props.overshootRight !== props.overshootRight ||
      this.props.overshootFriction !== props.overshootFriction ||
      this.state.leftWidth !== state.leftWidth ||
      this.state.rightOffset !== state.rightOffset ||
      this.state.rowWidth !== state.rowWidth
    ) {
      this.updateAnimatedEvent(props, state);
    }
  }

  private onGestureEvent?: (
    event: GestureEvent<PanGestureHandlerEventPayload>
  ) => void;
  private transX?: Animated.AnimatedInterpolation;
  private showLeftAction?: Animated.AnimatedInterpolation | Animated.Value;
  private leftActionTranslate?: Animated.AnimatedInterpolation;
  private showRightAction?: Animated.AnimatedInterpolation | Animated.Value;
  private rightActionTranslate?: Animated.AnimatedInterpolation;

  private updateAnimatedEvent = (
    props: SwipeableProps,
    state: SwipeableState
  ) => {
    const { friction, overshootFriction } = props;
    const { dragX, rowTranslation, leftWidth = 0, rowWidth = 0 } = state;
    const { rightOffset = rowWidth } = state;
    const rightWidth = Math.max(0, rowWidth - rightOffset);

    const {
      overshootLeft = leftWidth > 0,
      overshootRight = rightWidth > 0,
    } = props;

    const transX = Animated.add(
      rowTranslation,
      dragX.interpolate({
        inputRange: [0, friction!],
        outputRange: [0, 1],
      })
    ).interpolate({
      inputRange: [
        -rightWidth - (overshootRight ? 1 : overshootFriction!),
        -rightWidth,
        leftWidth,
        leftWidth + (overshootLeft ? 1 : overshootFriction!),
      ],
      outputRange: [
        -rightWidth - (overshootRight || overshootFriction! > 1 ? 1 : 0),
        -rightWidth,
        leftWidth,
        leftWidth + (overshootLeft || overshootFriction! > 1 ? 1 : 0),
      ],
    });
    this.transX = transX;
    this.showLeftAction =
      leftWidth > 0
        ? transX.interpolate({
            inputRange: [-1, 0, leftWidth],
            outputRange: [0, 0, 1],
          })
        : new Animated.Value(0);
    this.leftActionTranslate = this.showLeftAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [-10000, 0],
      extrapolate: 'clamp',
    });
    this.showRightAction =
      rightWidth > 0
        ? transX.interpolate({
            inputRange: [-rightWidth, 0, 1],
            outputRange: [1, 0, 0],
          })
        : new Animated.Value(0);
    this.rightActionTranslate = this.showRightAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [-10000, 0],
      extrapolate: 'clamp',
    });
  };

  private onTapHandlerStateChange = ({
    nativeEvent,
  }: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this.close();
    }
  };

  private onHandlerStateChange = (
    ev: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      this.handleRelease(ev);
    }
  };

  private handleRelease = (
    ev: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    const { velocityX, translationX: dragX } = ev.nativeEvent;
    const { leftWidth = 0, rowWidth = 0, rowState } = this.state;
    const { rightOffset = rowWidth } = this.state;
    const rightWidth = rowWidth - rightOffset;
    const {
      friction,
      leftThreshold = leftWidth / 2,
      rightThreshold = rightWidth / 2,
    } = this.props;

    const startOffsetX = this.currentOffset() + dragX / friction!;
    const translationX = (dragX + DRAG_TOSS * velocityX) / friction!;

    let toValue = 0;
    if (rowState === 0) {
      if (translationX > leftThreshold) {
        toValue = leftWidth;
      } else if (translationX < -rightThreshold) {
        toValue = -rightWidth;
      }
    } else if (rowState === 1) {
      // swiped to left
      if (translationX > -leftThreshold) {
        toValue = leftWidth;
      }
    } else {
      // swiped to right
      if (translationX < rightThreshold) {
        toValue = -rightWidth;
      }
    }

    this.animateRow(startOffsetX, toValue, velocityX / friction!);
  };

  private animateRow = (
    fromValue: number,
    toValue: number,
    velocityX?:
      | number
      | {
          x: number;
          y: number;
        }
  ) => {
    const { dragX, rowTranslation } = this.state;
    dragX.setValue(0);
    rowTranslation.setValue(fromValue);

    this.setState({ rowState: Math.sign(toValue) });
    Animated.spring(rowTranslation, {
      restSpeedThreshold: 1.7,
      restDisplacementThreshold: 0.4,
      velocity: velocityX,
      bounciness: 0,
      toValue,
      useNativeDriver: this.props.useNativeAnimations!,
      ...this.props.animationOptions,
    }).start(({ finished }) => {
      if (finished) {
        if (toValue > 0 && this.props.onSwipeableLeftOpen) {
          this.props.onSwipeableLeftOpen();
        } else if (toValue < 0 && this.props.onSwipeableRightOpen) {
          this.props.onSwipeableRightOpen();
        }

        if (toValue === 0) {
          this.props.onSwipeableClose?.();
        } else {
          this.props.onSwipeableOpen?.();
        }
      }
    });
    if (toValue > 0 && this.props.onSwipeableLeftWillOpen) {
      this.props.onSwipeableLeftWillOpen();
    } else if (toValue < 0 && this.props.onSwipeableRightWillOpen) {
      this.props.onSwipeableRightWillOpen();
    }

    if (toValue === 0) {
      this.props.onSwipeableWillClose?.();
    } else {
      this.props.onSwipeableWillOpen?.();
    }
  };

  private onRowLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    this.setState({ rowWidth: nativeEvent.layout.width });
  };

  private currentOffset = () => {
    const { leftWidth = 0, rowWidth = 0, rowState } = this.state;
    const { rightOffset = rowWidth } = this.state;
    const rightWidth = rowWidth - rightOffset;
    if (rowState === 1) {
      return leftWidth;
    } else if (rowState === -1) {
      return -rightWidth;
    }
    return 0;
  };

  close = () => {
    this.animateRow(this.currentOffset(), 0);
  };

  openLeft = () => {
    const { leftWidth = 0 } = this.state;
    this.animateRow(this.currentOffset(), leftWidth);
  };

  openRight = () => {
    const { rowWidth = 0 } = this.state;
    const { rightOffset = rowWidth } = this.state;
    const rightWidth = rowWidth - rightOffset;
    this.animateRow(this.currentOffset(), -rightWidth);
  };

  render() {
    const { rowState } = this.state;
    const { children, renderLeftActions, renderRightActions } = this.props;

    const left = renderLeftActions && (
      <Animated.View
        style={[
          styles.leftActions,
          // all those and below parameters can have ! since they are all asigned in constructor in `updateAnimatedEvent` but TS cannot spot it for some reason
          { transform: [{ translateX: this.leftActionTranslate! }] },
        ]}>
        {renderLeftActions(this.showLeftAction!, this.transX!)}
        <View
          onLayout={({ nativeEvent }) =>
            this.setState({ leftWidth: nativeEvent.layout.x })
          }
        />
      </Animated.View>
    );

    const right = renderRightActions && (
      <Animated.View
        style={[
          styles.rightActions,
          { transform: [{ translateX: this.rightActionTranslate! }] },
        ]}>
        {renderRightActions(this.showRightAction!, this.transX!)}
        <View
          onLayout={({ nativeEvent }) =>
            this.setState({ rightOffset: nativeEvent.layout.x })
          }
        />
      </Animated.View>
    );

    return (
      <PanGestureHandler
        activeOffsetX={[-10, 10]}
        {...this.props}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}>
        <Animated.View
          onLayout={this.onRowLayout}
          style={[styles.container, this.props.containerStyle]}>
          {left}
          {right}
          <TapGestureHandler
            enabled={rowState !== 0}
            onHandlerStateChange={this.onTapHandlerStateChange}>
            <Animated.View
              pointerEvents={rowState === 0 ? 'auto' : 'box-only'}
              style={[
                {
                  transform: [{ translateX: this.transX! }],
                },
                this.props.childrenContainerStyle,
              ]}>
              {children}
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  leftActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  rightActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
});
