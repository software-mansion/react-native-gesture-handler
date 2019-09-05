// @flow

// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us
// to move faster and fix possible issues quicker

import React, { Component } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { PanGestureHandler, TapGestureHandler, State } from './GestureHandler';

const DRAG_TOSS = 0.05;

export type PropType = {
  children: any,
  friction: number,
  leftThreshold?: number,
  leftDefaultActionConfig?: {
    onTrigger: Function,
    threshold: number,
    menuWidth: number,
  },
  rightThreshold?: number,
  rightDefaultActionConfig?: {
    onTrigger: Function,
    threshold: number,
    menuWidth: number,
  },
  overshootLeft?: boolean,
  overshootRight?: boolean,
  overshootFriction: number,
  onSwipeableLeftOpen?: Function,
  onSwipeableRightOpen?: Function,
  onSwipeableOpen?: Function,
  onSwipeableClose?: Function,
  onSwipeableLeftWillOpen?: Function,
  onSwipeableRightWillOpen?: Function,
  onSwipeableWillOpen?: Function,
  onSwipeableWillClose?: Function,
  renderLeftActions?: (
    progressAnimatedValue: any,
    dragAnimatedValue: any
  ) => any,
  renderRightActions?: (
    progressAnimatedValue: any,
    dragAnimatedValue: any
  ) => any,
  useNativeAnimations: boolean,
  animationOptions?: Object,
  containerStyle?: Object,
  childrenContainerStyle?: Object,
};
type StateType = {
  dragX: Animated.Value,
  rowTranslation: Animated.Value,
  rowState: -1 | 0 | 1, // RHS Action menu open, neither open, LHS open
  leftFullWidth: number | typeof undefined,
  rightOffset: number | typeof undefined,
  rowWidth: number | typeof undefined,
};

export default class Swipeable extends Component<PropType, StateType> {
  static defaultProps = {
    friction: 1,
    overshootFriction: 1,
    useNativeAnimations: true,
  };
  _onGestureEvent: ?Animated.Event;
  _transX: ?Animated.Interpolation;
  _showLeftAction: ?Animated.Interpolation | ?Animated.Value;
  _leftActionTranslate: ?Animated.Interpolation;
  _showRightAction: ?Animated.Interpolation | ?Animated.Value;
  _rightActionTranslate: ?Animated.Interpolation;
  _defaultActionTriggered: -1 | 0 | 1; // RHS Action menu default triggered, neither, LHS triggered

  constructor(props: PropType) {
    super(props);
    const dragX = new Animated.Value(0);
    this.state = {
      dragX,
      rowTranslation: new Animated.Value(0),
      rowState: 0,
      leftFullWidth: undefined,
      rightOffset: undefined,
      rowWidth: undefined,
    };
    this._updateAnimatedEvent(props, this.state);

    this._onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: dragX } }],
      { useNativeDriver: props.useNativeAnimations }
    );
    this._defaultActionTriggered = 0;
  }

  UNSAFE_componentWillUpdate(nextProps: PropType, nextState: StateType) {
    if (
      this.props.friction !== nextProps.friction ||
      this.props.overshootLeft !== nextProps.overshootLeft ||
      this.props.overshootRight !== nextProps.overshootRight ||
      this.props.overshootFriction !== nextProps.overshootFriction ||
      this.state.leftFullWidth !== nextState.leftFullWidth ||
      this.state.rightOffset !== nextState.rightOffset ||
      this.state.rowWidth !== nextState.rowWidth
    ) {
      this._updateAnimatedEvent(nextProps, nextState);
    }
  }

  _updateAnimatedEvent = (nextProps: PropType, nextState: StateType) => {
    const { friction, overshootFriction, useNativeAnimations } = nextProps;
    const {
      dragX,
      rowTranslation,
      leftFullWidth = 0,
      rowWidth = 0,
    } = nextState;
    const { rightOffset = rowWidth } = nextState;
    const rightWidth = Math.max(0, rowWidth - rightOffset);

    const {
      overshootLeft = leftFullWidth > 0,
      overshootRight = rightWidth > 0,
    } = nextProps;

    const transX = Animated.add(
      rowTranslation,
      dragX.interpolate({
        inputRange: [0, friction],
        outputRange: [0, 1],
      })
    ).interpolate({
      inputRange: [
        -rightWidth - (overshootRight ? 1 : overshootFriction),
        -rightWidth,
        leftFullWidth,
        leftFullWidth + (overshootLeft ? 1 : overshootFriction),
      ],
      outputRange: [
        -rightWidth - (overshootRight || overshootFriction > 1 ? 1 : 0),
        -rightWidth,
        leftFullWidth,
        leftFullWidth + (overshootLeft || overshootFriction > 1 ? 1 : 0),
      ],
    });
    this._transX = transX;
    this._showLeftAction =
      leftFullWidth > 0
        ? transX.interpolate({
            inputRange: [-1, 0, leftFullWidth],
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

  _onTapHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this.close();
    }
  };

  _onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this._handleRelease(nativeEvent);
    }
  };

  /* Notes:
   *
   * 1) Action Menu width (the 'normal' width of the LHS and RHS menu's revealed when the default content is swiped to
   * one side) is a bit tr(icky) to determine when working with Default Action menu item triggering.
   *
   * On ios the Default Action Menu behaviour that we are trying to enable is that found in apps such as Mail. In these
   * ios apps, once the Action Menu is revealed if the drag continues past a Default Action triggering point
   * (~ somewhere around  3/4 screen width in portrait) then a Default Action menu item is triggered when the drag
   * is release e.g. Read/Unread toggling on the LHS, Delete on the RHS in the Mail App.
   *
   * This works as follows, between the Action Menu being fully open and the Default Action triggering point, the
   * animation changes to indicate:
   *    a) What the Default Action is.
   *    b) That the onrelease trigger point is close.
   * Releasing between these points, returns the menu to the 'normal' Action Menu open width.
   *
   * Once past Default Action trigger point, the animation is altered to indicate that onrelease the Default
   * Action will now be triggered. On release, the default  Action Menu item is triggered and the Action Menu is
   * closed.
   *
   * In this component, when Default Actions are not being used, the Action Menu width is determined by passing Action
   * menu containers that wrap closely around the buttons that they contain. The Action Menu 'normal' width is then
   * is determined as a side effect of using the "left" and "right" constants (that hold theses containers) in the
   * main render(), via the hidden view onrender callback technique.
   *
   * However, in this component in order:
   *    a) Achieve Default Action animations that extend/grow past the 'normal' width of the Action Menu.
   *    b) That are backward compatible with existing non-Default Action usage.
   * The approach adopted here (i) is to have the user supply Action menu styled containers that would occupy the
   * entire row width when fully revealed (and not just the width of the buttons) and to subsequently animate the
   * required menu extension and behaviour into those containers.
   *
   * One, side effect of this backward compatibility though, is that the onrender technique to determine menu width
   * cannot be used with Default Action capable Action Menu's because it will incorrect report the full row width.
   * Instead the Action Menu width must be defined as a prop that is passed to the component.
   *
   * (i) Other approaches involving menu containers like the non-Default Action case and test rendering to
   * determine menu width automatically, before re-rendering and styling into a full-width container seem even more
   * complicated and are less performant.
   * */

  _handleRelease = nativeEvent => {
    const { velocityX, translationX: dragX } = nativeEvent;
    const { leftFullWidth = 0, rowWidth = 0, rowState } = this.state;
    const { rightOffset = rowWidth } = this.state;
    const rightFullWidth = rowWidth - rightOffset;

    const {
      friction,
      leftDefaultActionConfig,
      rightDefaultActionConfig,
    } = this.props;

    const leftMenuWidth = leftDefaultActionConfig
      ? leftDefaultActionConfig.menuWidth
      : leftFullWidth;

    const rightMenuWidth = rightDefaultActionConfig
      ? rightDefaultActionConfig.menuWidth
      : rightFullWidth;

    const { leftThreshold = leftMenuWidth / 2 } = this.props;
    const { rightThreshold = rightMenuWidth / 2 } = this.props;

    const xCurrentOffset = this._currentOffset() + dragX / friction;
    const translationX = (dragX + DRAG_TOSS * velocityX) / friction;

    // Decide what type of animation to apply to the row.
    let xAnimateToOffset;
    switch (rowState) {
      case 0: // Neither action menu is open. We can open the action menu, or if we've got Default Action set
        // then we can trigger those and animate the menu shut.

        leftDefaultActionConfig &&
          translationX > leftDefaultActionConfig.threshold &&
          (this._defaultActionTriggered = 1);

        rightDefaultActionConfig &&
          translationX < -rightDefaultActionConfig.threshold &&
          (this._defaultActionTriggered = -1);

        xAnimateToOffset = !!this._defaultActionTriggered
          ? 0
          : translationX > leftThreshold
            ? leftMenuWidth // Open left menu
            : translationX < -rightThreshold
              ? -rightMenuWidth // Open right menu
              : 0;

        break;

      case 1: // The LHS Action menu is open.
        leftDefaultActionConfig &&
          translationX > leftDefaultActionConfig.threshold - leftMenuWidth &&
          (this._defaultActionTriggered = 1);

        xAnimateToOffset = this._defaultActionTriggered
          ? 0
          : translationX < -leftThreshold
            ? 0
            : leftMenuWidth;

        break;

      case -1: // The RHS Action menu is open.
        rightDefaultActionConfig &&
          translationX < -rightDefaultActionConfig.threshold + rightMenuWidth &&
          (this._defaultActionTriggered = -1);

        xAnimateToOffset = this._defaultActionTriggered
          ? 0
          : translationX > rightThreshold
            ? 0
            : -rightMenuWidth;

        break;

      default:
        xAnimateToOffset = 0;
        console.error(
          'Triggering default menu closure, rowState is not in a recognised state. It is ',
          rowState
        );
    }
    this._animateRow(xCurrentOffset, xAnimateToOffset, velocityX / friction);
  };

  _animateRow = (fromValue: number, toValue: number, velocityX) => {
    const { dragX, rowTranslation } = this.state;
    dragX.setValue(0);
    rowTranslation.setValue(fromValue);
    // $FlowFixMe - Math.sign can only return -1, +/-0 and +1 despite what flow thinks
    this.setState({ rowState: Math.sign(toValue) });
    Animated.spring(rowTranslation, {
      restSpeedThreshold: 1.7,
      restDisplacementThreshold: 0.4,
      velocity: velocityX,
      bounciness: 0,
      toValue,
      useNativeDriver: this.props.useNativeAnimations,
      ...this.props.animationOptions,
    }).start(({ finished }) => {
      if (finished) {
        if (toValue > 0 && this.props.onSwipeableLeftOpen) {
          this.props.onSwipeableLeftOpen();
        } else if (toValue < 0 && this.props.onSwipeableRightOpen) {
          this.props.onSwipeableRightOpen();
        }

        if (toValue === 0) {
          this.props.onSwipeableClose && this.props.onSwipeableClose();
        } else {
          this.props.onSwipeableOpen && this.props.onSwipeableOpen();
        }
      }
    });
    if (toValue > 0 && this.props.onSwipeableLeftWillOpen) {
      this.props.onSwipeableLeftWillOpen();
    } else if (toValue < 0 && this.props.onSwipeableRightWillOpen) {
      this.props.onSwipeableRightWillOpen();
    }

    if (toValue === 0) {
      this.props.onSwipeableWillClose && this.props.onSwipeableWillClose();
    } else {
      this.props.onSwipeableWillOpen && this.props.onSwipeableWillOpen();
    }

    if (
      this.props.leftDefaultActionConfig &&
      this._defaultActionTriggered === 1
    ) {
      this._defaultActionTriggered = 0;
      this.props.leftDefaultActionConfig.onTrigger();
    } else if (
      this.props.rightDefaultActionConfig &&
      this._defaultActionTriggered === -1
    ) {
      this._defaultActionTriggered = 0;
      this.props.rightDefaultActionConfig.onTrigger();
    }
  };

  _onRowLayout = ({ nativeEvent }) => {
    this.setState({ rowWidth: nativeEvent.layout.width });
  };

  _currentOffset = (): number => {
    const {
      leftDefaultActionConfig = false,
      rightDefaultActionConfig = false,
    } = this.props;
    const { leftFullWidth = 0, rowWidth = 0, rowState } = this.state;
    const { rightOffset = rowWidth } = this.state;
    const rightWidth = rowWidth - rightOffset;

    switch (rowState) {
      case 0: // Neither action menu is open.
        return 0;

      case 1: // The LHS Action menu is open.
        return leftDefaultActionConfig
          ? leftDefaultActionConfig.menuWidth
          : leftFullWidth;

      case -1: // The RHS Action menu is open.
        return rightDefaultActionConfig
          ? -rightDefaultActionConfig.menuWidth
          : -rightWidth;

      default:
        console.error(
          'Unable to determine currentOffset returning 0, rowState is not in a recognised state. It is ',
          rowState
        );
        return 0;
    }
  };

  close = () => {
    this._animateRow(this._currentOffset(), 0);
  };

  openLeft = () => {
    const { leftFullWidth = 0 } = this.state;
    this._animateRow(this._currentOffset(), leftFullWidth);
  };

  openRight = () => {
    const { rowWidth = 0 } = this.state;
    const { rightOffset = rowWidth } = this.state;
    const rightWidth = rowWidth - rightOffset;
    this._animateRow(this._currentOffset(), -rightWidth);
  };

  render() {
    const { rowState } = this.state;
    const {
      children,
      renderLeftActions,
      renderRightActions,
      leftDefaultActionConfig,
    } = this.props;

    const left = renderLeftActions && (
      <Animated.View
        style={[
          styles.leftActions,
          { transform: [{ translateX: this._leftActionTranslate }] },
        ]}>
        {renderLeftActions(this._showLeftAction, this._transX)}
        <View
          onLayout={({ nativeEvent }) => {
            this.setState({ leftFullWidth: nativeEvent.layout.x });
          }}
        />
      </Animated.View>
    );

    const right = renderRightActions && (
      <Animated.View
        style={[
          styles.rightActions,
          { transform: [{ translateX: this._rightActionTranslate }] },
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
        {...this.props}
        minDeltaX={10}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}>
        <Animated.View
          onLayout={this._onRowLayout}
          style={[styles.rowContainer, this.props.containerStyle]}>
          {left}
          {right}
          <TapGestureHandler
            enabled={rowState !== 0}
            onHandlerStateChange={this._onTapHandlerStateChange}>
            <Animated.View
              pointerEvents={rowState === 0 ? 'auto' : 'box-only'}
              style={[
                {
                  transform: [{ translateX: this._transX }],
                },
                styles.rowSwipedContent,
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
  rowContainer: {
    overflow: 'hidden',
  },
  rowSwipedContent: {},
  leftActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  rightActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row-reverse',
  },
});
