// @flow
import React, { Component } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';

const MIN_SWIPE_DISTANCE = 3;
const SLOP = 30;
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
  dragX: any,
  touchX: any,
  drawerTranslation: any,
  containerWidth: number,
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

    const dragX = new Animated.Value(0);
    const touchX = new Animated.Value(0);
    const drawerTranslation = new Animated.Value(0);

    this.state = {
      dragX,
      touchX,
      drawerTranslation,
      drawerShown: false,
      containerWidth: 0,
    };

    this._updateAnimatedEvent(props, this.state);
  }

  componentWillUpdate(props, state) {
    if (
      this.props.drawerPosition !== props.drawerPosition ||
      this.props.drawerWidth !== props.drawerWidth ||
      this.state.containerWidth !== state.containerWidth
    ) {
      this._updateAnimatedEvent(props, state);
    }
  }

  _updateAnimatedEvent = (props, state) => {
    // Event definition is based on
    const { drawerPosition, drawerWidth } = props;
    const {
      dragX: dragXValue,
      touchX: touchXValue,
      drawerTranslation,
      containerWidth,
    } = state;

    let dragX = dragXValue;
    let touchX = touchXValue;

    if (drawerPosition !== 'left') {
      // Most of the code is written in a way to handle left-side drawer.
      // In order to handle right-side drawer the only thing we need to
      // do is to reverse events coming from gesture handler in a way they
      // emulate left-side drawer gestures. E.g. dragX is simply -dragX, and
      // touchX is calulcated by subtracing real touchX from the width of the
      // container (such that when touch happens at the right edge the value
      // is simply 0)
      dragX = Animated.multiply(new Animated.Value(-1), dragXValue);
      touchX = Animated.add(
        new Animated.Value(containerWidth),
        Animated.multiply(new Animated.Value(-1), touchXValue)
      );
      touchXValue.setValue(containerWidth);
    }

    // When closing drawer and user starts gesture outside of the drawer (in greyed
    // out area), we want the drawer to follow only once finger reaches the edge of the
    // drawer.
    // E.g. imagine that the revealed drawer is illustrate by X and the greyed out area by
    // dots. The touch gesture starts at '*' and moves left and its path is indicated by
    // an arrow pointing left
    // 1) +---------------+ 2) +---------------+ 3) +---------------+ 4) +---------------+
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    |XXXXXXXX|......|    |XXXXXXXX|.<-*..|    |XXXXXXXX|<--*..|    |XXXXX|<-----*..|
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    +---------------+    +---------------+    +---------------+    +---------------+
    //
    // For the above to work properly we define animated value that will keep start position
    // of the gesture. Then we use that value to calculate how much we need to subtract from
    // the dragX. If the gesture started on the greyed out area we take the distance from the
    // edge of the drawer to the start position. Otherwise we don't subtract at all and the
    // drawer be pulled back as soon as you start the pan.
    const startPositionX = Animated.add(
      touchX,
      Animated.multiply(new Animated.Value(-1), dragX)
    );

    const dragOffsetFromOnStartPosition = startPositionX.interpolate({
      inputRange: [drawerWidth - 1, drawerWidth, drawerWidth + 1],
      outputRange: [0, 0, 1],
    });

    const translationX = Animated.add(dragX, dragOffsetFromOnStartPosition);

    this._openValue = Animated.add(
      translationX,
      drawerTranslation
    ).interpolate({
      inputRange: [0, drawerWidth],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    this._onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: dragXValue, x: touchXValue } }],
      { useNativeDriver: props.useNativeAnimations }
    );
  };

  _handleContainerLayout = ({ nativeEvent }) => {
    this.setState({ containerWidth: nativeEvent.layout.width });
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
    const { drawerWidth, drawerPosition } = this.props;
    const { drawerShown, containerWidth } = this.state;
    let { translationX: dragX, velocityX, x: touchX } = nativeEvent;

    if (drawerPosition !== 'left') {
      // See description in _updateAnimatedEvent about why events are flipped
      // for right-side drawer
      dragX = -dragX;
      touchX = containerWidth - touchX;
      velocityX = -velocityX;
    }

    const gestureStartX = touchX - dragX;
    const dragOffsetBasedOnStart =
      gestureStartX > drawerWidth ? gestureStartX - drawerWidth : 0;

    const startOffsetX =
      dragX + dragOffsetBasedOnStart + (drawerShown ? drawerWidth : 0);
    const projOffsetX = startOffsetX + DRAG_TOSS * velocityX;

    const shouldOpen = projOffsetX > drawerWidth / 2;

    if (shouldOpen) {
      this._animateDrawer(startOffsetX, drawerWidth, velocityX);
    } else {
      this._animateDrawer(startOffsetX, 0, velocityX);
    }
  };

  _animateDrawer = (fromValue: number, toValue: number, velocity: ?number) => {
    this.state.dragX.setValue(0);
    this.state.touchX.setValue(
      this.props.drawerPosition === 'left' ? 0 : this.state.containerWidth
    );
    this.state.drawerTranslation.setValue(fromValue);

    this.setState({ drawerShown: toValue !== 0 });
    Animated.spring(this.state.drawerTranslation, {
      velocity,
      bounciness: 0,
      toValue,
      useNativeDriver: this.props.useNativeAnimations,
    }).start();
  };

  openDrawer = (options: DrawerMovementOptionType = {}) => {
    this._animateDrawer(0, this.props.drawerWidth, options.velocity);
  };

  closeDrawer = (options: DrawerMovementOptionType = {}) => {
    this._animateDrawer(this.props.drawerWidth, 0, options.velocity);
  };

  render() {
    const {
      accessibilityViewIsModal,
      drawerShown,
      containerWidth,
    } = this.state;

    const { drawerBackgroundColor, drawerWidth, drawerPosition } = this.props;

    const fromLeft = drawerPosition === 'left';

    const dynamicDrawerStyles = {
      backgroundColor: drawerBackgroundColor,
      width: drawerWidth,
    };

    const closedDrawerOffset = fromLeft ? -drawerWidth : drawerWidth;
    const drawerTranslateX = this._openValue.interpolate({
      inputRange: [0, 1],
      outputRange: [closedDrawerOffset, 0],
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
    const overlayOpacity = this._openValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.7],
      extrapolate: 'clamp',
    });
    const animatedOverlayStyles = { opacity: overlayOpacity };

    // When drawer is closed we want the hitSlop to be horizontally shorter
    // than the container size by the value of SLOP. This will make it only
    // activate when gesture happens not further than SLOP away from the edge
    const hitSlop = fromLeft
      ? { right: drawerShown ? 0 : SLOP - containerWidth }
      : { left: drawerShown ? 0 : containerWidth - SLOP };

    return (
      <PanGestureHandler
        hitSlop={hitSlop}
        minOffsetX={gestureOrientation * MIN_SWIPE_DISTANCE}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._openingHandlerStateChange}>
        <Animated.View
          style={styles.main}
          onLayout={this._handleContainerLayout}>
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
