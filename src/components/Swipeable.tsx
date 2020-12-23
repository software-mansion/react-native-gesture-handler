// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us
// to move faster and fix possible issues quicker

import React, { Component } from 'react';
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
  PanGestureHandlerProperties,
  GestureEventEvent,
  PanGestureHandlerEventExtraPayload,
  HandlerStateChangeEvent,
  TapGestureHandlerEventExtraPayload,
} from '../handlers/gestureHandlers';
import State from '../State';

const DRAG_TOSS = 0.05;

type SwipeableExcludes = Exclude<
  keyof PanGestureHandlerProperties,
  'onGestureEvent' | 'onHandlerStateChange'
>;

interface SwipeableProperties
  extends Pick<PanGestureHandlerProperties, SwipeableExcludes> {
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
    progressAnimatedValue?: Animated.AnimatedInterpolation,
    dragAnimatedValue?: Animated.AnimatedInterpolation
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
    progressAnimatedValue?: Animated.AnimatedInterpolation,
    dragAnimatedValue?: Animated.AnimatedInterpolation
  ) => React.ReactNode;
  // TODO: above methods maybe should not take optional parameters
  useNativeAnimations?: boolean;
  animationOptions?: object;
  containerStyle?: StyleProp<ViewStyle>;
  childrenContainerStyle?: StyleProp<ViewStyle>;
}

type StateType = {
  dragX: Animated.Value;
  rowTranslation: Animated.Value;
  rowState: number;
  leftWidth: number | typeof undefined;
  rightOffset: number | typeof undefined;
  rowWidth: number | typeof undefined;
};

export default class Swipeable extends Component<
  SwipeableProperties,
  StateType
> {
  static defaultProps = {
    friction: 1,
    overshootFriction: 1,
    useNativeAnimations: true,
  };

  constructor(props: SwipeableProperties) {
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

  UNSAFE_componentWillUpdate(props: SwipeableProperties, state: StateType) {
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
    event: GestureEventEvent<PanGestureHandlerEventExtraPayload>
  ) => void;
  _transX?: Animated.AnimatedInterpolation;
  _showLeftAction?: Animated.AnimatedInterpolation | Animated.Value;
  _leftActionTranslate?: Animated.AnimatedInterpolation;
  _showRightAction?: Animated.AnimatedInterpolation | Animated.Value;
  _rightActionTranslate?: Animated.AnimatedInterpolation;

  private updateAnimatedEvent = (
    props: SwipeableProperties,
    state: StateType
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
    this._transX = transX;
    this._showLeftAction =
      leftWidth > 0
        ? transX.interpolate({
            inputRange: [-1, 0, leftWidth],
            outputRange: [0, 0, 1],
          })
        : new Animated.Value(0);
    this._leftActionTranslate = this._showLeftAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [-10000, 0],
      extrapolate: 'clamp',
    });
    this._showRightAction =
      rightWidth > 0
        ? transX.interpolate({
            inputRange: [-rightWidth, 0, 1],
            outputRange: [1, 0, 0],
          })
        : new Animated.Value(0);
    this._rightActionTranslate = this._showRightAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [-10000, 0],
      extrapolate: 'clamp',
    });
  };

  private onTapHandlerStateChange = ({
    nativeEvent,
  }: HandlerStateChangeEvent<TapGestureHandlerEventExtraPayload>) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this.close();
    }
  };

  private onHandlerStateChange = (
    ev: HandlerStateChangeEvent<PanGestureHandlerEventExtraPayload>
  ) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      this.handleRelease(ev);
    }
  };

  private handleRelease = (
    ev: HandlerStateChangeEvent<PanGestureHandlerEventExtraPayload>
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
          { transform: [{ translateX: this._leftActionTranslate! }] }, // TODO: may not be correct to !
        ]}>
        {renderLeftActions(this._showLeftAction, this._transX)}
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
          { transform: [{ translateX: this._rightActionTranslate! }] },
        ]}>
        {renderRightActions(this._showRightAction, this._transX)}
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
                  transform: [{ translateX: this._transX! }],
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
