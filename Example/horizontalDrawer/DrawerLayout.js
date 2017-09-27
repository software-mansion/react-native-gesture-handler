// @flow
import React, { Component } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';

const MIN_SWIPE_DISTANCE = 3;
const DRAG_TOSS = 0.05;

const IDLE = 'Idle';
const DRAGGING = 'Dragging';
const SETTLING = 'Settling';

export type PropType = {
  children: any,
  drawerBackgroundColor?: string,
  drawerLockMode?: 'unlocked' | 'locked-closed' | 'locked-open',
  drawerPosition: 'left' | 'right',
  drawerWidth: number,
  keyboardDismissMode?: 'none' | 'on-drag',
  onDrawerClose?: Function,
  onDrawerOpen?: Function,
  onDrawerSlide?: Function,
  onDrawerStateChanged?: Function,
  renderNavigationView: () => any,
  statusBarBackgroundColor?: string,
  useNativeAnimations?: boolean,
};

export type StateType = {
  accessibilityViewIsModal: boolean,
  drawerShown: boolean,
  openValue: any,
};

export type EventType = {
  stopPropagation: Function,
};

export type DrawerMovementOptionType = {
  velocity?: number,
};

export default class DrawerLayout extends Component {
  props: PropType;
  state: StateType;

  static defaultProps = {
    drawerWidth: 0,
    drawerPosition: 'left',
    useNativeAnimations: true,
  };

  static positions = {
    Left: 'left',
    Right: 'right',
  };

  constructor(props: PropType, context: any) {
    super(props, context);

    const fromLeft = props.drawerPosition === 'left';

    const dragX = new Animated.Value(0);
    const touchX = new Animated.Value(0);
    const drawerPosition = new Animated.Value(0);

    const startPositionX = Animated.add(
      touchX,
      Animated.multiply(new Animated.Value(-1), dragX)
    );

    const dragOffsetBasedOnStartPosition = startPositionX.interpolate({
      inputRange: [
        props.drawerWidth - 1,
        props.drawerWidth,
        props.drawerWidth + 1,
      ],
      outputRange: [0, 0, 1],
    });

    const translationX = Animated.add(dragX, dragOffsetBasedOnStartPosition);

    const openValue = Animated.add(translationX, drawerPosition).interpolate({
      inputRange: fromLeft ? [0, props.drawerWidth] : [-props.drawerWidth, 0],
      outputRange: fromLeft ? [0, 1] : [1, 0],
      extrapolate: 'clamp',
    });

    this.state = {
      dragX,
      touchX,
      drawerPosition,
      openValue,
      drawerShown: false,
    };

    this._onGestureEvent = ({ nativeEvent }) => {
      // console.log('NE', nativeEvent);
      dragX.setValue(nativeEvent.translationX);
      touchX.setValue(nativeEvent.x);
    };
    // Animated.event(
    //   [{ nativeEvent: { translationX: dragX, x: touchX } }],
    //   { useNativeDriver: props.useNativeAnimations }
    // );
  }

  render() {
    const { accessibilityViewIsModal, drawerShown, openValue } = this.state;

    const { drawerBackgroundColor, drawerWidth, drawerPosition } = this.props;

    const fromLeft = drawerPosition === 'left';

    const dynamicDrawerStyles = {
      backgroundColor: drawerBackgroundColor,
      width: drawerWidth,
    };

    const drawerTranslateX = openValue.interpolate({
      inputRange: [0, 1],
      outputRange: [this._drawerClosedOffset(), 0],
      extrapolate: 'clamp',
    });
    const drawerStyles = {
      transform: [{ translateX: drawerTranslateX }],
      flexDirection: fromLeft ? 'row' : 'row-reverse',
    };

    const dragHandlerStyle = drawerShown
      ? styles.dragHandlerOpened
      : styles.dragHandler;

    // gestureOrientation is 1 if the expected gesture is from left to right and -1 otherwise
    // e.g. when drawer is on the left and is closed we expect left to right gesture, thus
    // orientation will be 1.
    const gestureOrientation = (fromLeft ? 1 : -1) * (drawerShown ? -1 : 1);

    /* Overlay styles */
    const overlayOpacity = openValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.7],
      extrapolate: 'clamp',
    });
    const animatedOverlayStyles = { opacity: overlayOpacity };

    return (
      <PanGestureHandler
        minOffsetX={gestureOrientation * MIN_SWIPE_DISTANCE}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._openingHandlerStateChange}>
        <Animated.View style={styles.main}>
          {this.props.children}
          <Animated.View
            pointerEvents="none"
            style={[styles.overlay, animatedOverlayStyles]}
          />
          <Animated.View
            pointerEvents="box-none"
            accessibilityViewIsModal={accessibilityViewIsModal}
            style={[styles.drawerContainer, drawerStyles]}>
            <View style={[styles.drawer, dynamicDrawerStyles]}>
              {this.props.renderNavigationView()}
            </View>
            <TapGestureHandler
              onHandlerStateChange={this._onTapHandlerStateChange}>
              <Animated.View style={dragHandlerStyle} />
            </TapGestureHandler>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    );
  }

  _drawerClosedOffset = () => {
    const { drawerPosition, drawerWidth } = this.props;
    if (drawerPosition === 'left') {
      return -drawerWidth;
    } else {
      return drawerWidth;
    }
  };

  _openingHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this._handleRelease(nativeEvent);
    }
  };

  _onTapHandlerStateChange = ({ nativeEvent }) => {
    if (this.state.drawerShown && nativeEvent.oldState === State.ACTIVE) {
      this.closeDrawer();
    }
  };

  _handleRelease = nativeEvent => {
    const { drawerWidth } = this.props;
    const { drawerShown } = this.state;
    const { translationX: dragX, velocityX, x: touchX } = nativeEvent;

    const gestureStartX = touchX - dragX;
    const dragOffsetBasedOnStart =
      gestureStartX > drawerWidth ? gestureStartX - drawerWidth : 0;

    const startOffsetX =
      dragX +
      dragOffsetBasedOnStart +
      (drawerShown ? -this._drawerClosedOffset() : 0);
    const projOffsetX = startOffsetX + DRAG_TOSS * velocityX;

    const shouldOpen = Math.abs(projOffsetX) > drawerWidth / 2;

    if (shouldOpen) {
      this._animateDrawer(startOffsetX, -this._drawerClosedOffset(), velocityX);
    } else {
      this._animateDrawer(startOffsetX, 0, velocityX);
    }
  };

  _animateDrawer = (fromValue: number, toValue: number, velocity: ?number) => {
    this.state.dragX.setValue(0);
    this.state.touchX.setValue(0);
    this.state.drawerPosition.setValue(fromValue);

    this.setState({ drawerShown: toValue !== 0 });
    Animated.spring(this.state.drawerPosition, {
      velocity,
      bounciness: 0,
      toValue,
      useNativeDriver: this.props.useNativeAnimations,
    }).start();
  };

  openDrawer = (options: DrawerMovementOptionType = {}) => {
    this._animateDrawer(0, -this._drawerClosedOffset(), options.velocity);
  };

  closeDrawer = (options: DrawerMovementOptionType = {}) => {
    this._animateDrawer(-this._drawerClosedOffset(), 0, options.velocity);
  };
}

const styles = StyleSheet.create({
  drawer: { flex: 0 },
  drawerContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1001,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
    zIndex: 0,
    overflow: 'hidden',
  },
  dragHandlerOpened: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1000,
  },
});
