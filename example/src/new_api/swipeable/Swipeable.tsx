// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us to
// move faster and fix possible issues quicker

import { useEffect, useState } from "react";
import { Gesture, GestureDetector, PanGestureHandlerProps } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { I18nManager, StyleSheet } from "react-native";

const DRAG_TOSS = 0.05;

type SwipeableExcludes = Exclude<
  keyof PanGestureHandlerProps,
  'onGestureEvent' | 'onHandlerStateChange'
>;

// Animated.AnimatedInterpolation has been converted to a generic type
// in @types/react-native 0.70. This way we can maintain compatibility
// with all versions of @types/react-native
// todo check what can replace this, and if its necessary
//type AnimatedInterpolation = ReturnType<Animated.Value['interpolate']>;

export interface SwipeableProps
  extends Pick<PanGestureHandlerProps, SwipeableExcludes> {
  /**
   * Enables two-finger gestures on supported devices, for example iPads with
   * trackpads. If not enabled the gesture will require click + drag, with
   * `enableTrackpadTwoFingerGesture` swiping with two fingers will also trigger
   * the gesture.
   */
  enableTrackpadTwoFingerGesture?: boolean;

  /**
   * Specifies how much the visual interaction will be delayed compared to the
   * gesture distance. e.g. value of 1 will indicate that the swipeable panel
   * should exactly follow the gesture, 2 means it is going to be two times
   * "slower".
   */
  friction?: number;

  /**
   * Distance from the left edge at which released panel will animate to the
   * open state (or the open panel will animate into the closed state). By
   * default it's a half of the panel's width.
   */
  leftThreshold?: number;

  /**
   * Distance from the right edge at which released panel will animate to the
   * open state (or the open panel will animate into the closed state). By
   * default it's a half of the panel's width.
   */
  rightThreshold?: number;

  /**
   * Distance that the panel must be dragged from the left edge to be considered
   * a swipe. The default value is 10.
   */
  dragOffsetFromLeftEdge?: number;

  /**
   * Distance that the panel must be dragged from the right edge to be considered
   * a swipe. The default value is 10.
   */
  dragOffsetFromRightEdge?: number;

  /**
   * Value indicating if the swipeable panel can be pulled further than the left
   * actions panel's width. It is set to true by default as long as the left
   * panel render method is present.
   */
  overshootLeft?: boolean;

  /**
   * Value indicating if the swipeable panel can be pulled further than the
   * right actions panel's width. It is set to true by default as long as the
   * right panel render method is present.
   */
  overshootRight?: boolean;

  /**
   * Specifies how much the visual interaction will be delayed compared to the
   * gesture distance at overshoot. Default value is 1, it mean no friction, for
   * a native feel, try 8 or above.
   */
  overshootFriction?: number;

  /**
   * @deprecated Use `direction` argument of onSwipeableOpen()
   *
   * Called when left action panel gets open.
   */
  onSwipeableLeftOpen?: () => void;

  /**
   * @deprecated Use `direction` argument of onSwipeableOpen()
   *
   * Called when right action panel gets open.
   */
  onSwipeableRightOpen?: () => void;

  /**
   * Called when action panel gets open (either right or left).
   */
  onSwipeableOpen?: (direction: 'left' | 'right', swipeable: Swipeable) => void;

  /**
   * Called when action panel is closed.
   */
  onSwipeableClose?: (
    direction: 'left' | 'right',
    swipeable: Swipeable
  ) => void;

  /**
   * @deprecated Use `direction` argument of onSwipeableWillOpen()
   *
   * Called when left action panel starts animating on open.
   */
  onSwipeableLeftWillOpen?: () => void;

  /**
   * @deprecated Use `direction` argument of onSwipeableWillOpen()
   *
   * Called when right action panel starts animating on open.
   */
  onSwipeableRightWillOpen?: () => void;

  /**
   * Called when action panel starts animating on open (either right or left).
   */
  onSwipeableWillOpen?: (direction: 'left' | 'right') => void;

  /**
   * Called when action panel starts animating on close.
   */
  onSwipeableWillClose?: (direction: 'left' | 'right') => void;

  /**
   * Called when action panel starts being shown on dragging to open.
   */
  onSwipeableOpenStartDrag?: (direction: 'left' | 'right') => void;

  /**
   * Called when action panel starts being shown on dragging to close.
   */
  onSwipeableCloseStartDrag?: (direction: 'left' | 'right') => void;

  /**
   *
   * This map describes the values to use as inputRange for extra interpolation:
   * AnimatedValue: [startValue, endValue]
   *
   * progressAnimatedValue: [0, 1] dragAnimatedValue: [0, +]
   *
   * To support `rtl` flexbox layouts use `flexDirection` styling.
   * */
  renderLeftActions?: (
    progressAnimatedValue: AnimatedInterpolation,
    dragAnimatedValue: AnimatedInterpolation,
    swipeable: Swipeable
  ) => React.ReactNode;
  /**
   *
   * This map describes the values to use as inputRange for extra interpolation:
   * AnimatedValue: [startValue, endValue]
   *
   * progressAnimatedValue: [0, 1] dragAnimatedValue: [0, -]
   *
   * To support `rtl` flexbox layouts use `flexDirection` styling.
   * */
  renderRightActions?: (
    progressAnimatedValue: AnimatedInterpolation,
    dragAnimatedValue: AnimatedInterpolation,
    swipeable: Swipeable
  ) => React.ReactNode;

  useNativeAnimations?: boolean;

  animationOptions?: Record<string, unknown>;

  /**
   * Style object for the container (`Animated.View`), for example to override
   * `overflow: 'hidden'`.
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Style object for the children container (`Animated.View`), for example to
   * apply `flex: 1`
   */
  childrenContainerStyle?: StyleProp<ViewStyle>;
}


export default function Swipeable(props: SwipeableProps) {
  const dragX = useSharedValue<number>(0);
  const rowTranslation = useSharedValue<number>(0);
  const [rowState, setRowState] = useState<number>(0);
  const [leftWidth, setLeftWidth] = useState<number>(0);
  const [rightOffset, setRightOffset] = useState<number>(0);
  const [rowWidth, setRowWidth] = useState<number>(0);

  
  static defaultProps = {
    friction: 1,
    overshootFriction: 1,
    useNativeAnimations: true,
  };

  useEffect(() => {
    updateAnimatedEvent(props, state);

    onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: dragX } }],
      { useNativeDriver: props.useNativeAnimations! }
    );
  }, []);

  const shouldComponentUpdate = (props: SwipeableProps, state: SwipeableState) => {
    if (
      props.friction !== props.friction ||
      props.overshootLeft !== props.overshootLeft ||
      props.overshootRight !== props.overshootRight ||
      props.overshootFriction !== props.overshootFriction ||
      leftWidth !== leftWidth ||
      rightOffset !== rightOffset ||
      rowWidth !== rowWidth
    ) {
      updateAnimatedEvent(props, state);
    }

    return true;
  }

  const onGestureEvent?: (
    event: GestureEvent<PanGestureHandlerEventPayload>
  ) => void;
  const transX?: AnimatedInterpolation;
  const showLeftAction?: AnimatedInterpolation | Animated.Value;
  const leftActionTranslate?: AnimatedInterpolation;
  const showRightAction?: AnimatedInterpolation | Animated.Value;
  const rightActionTranslate?: AnimatedInterpolation;

  const updateAnimatedEvent = (
    props: SwipeableProps,
  ) => {
    const { friction, overshootFriction } = props;

    setLeftWidth(0);
    setRowWidth(0);
    setRightOffset(0);

    const { rightOffset = rowWidth } = state;
    const rightWidth = Math.max(0, rowWidth - rightOffset);

    const { overshootLeft = leftWidth > 0, overshootRight = rightWidth > 0 } =
      props;

    const transX = Animated.add(
      rowTranslation,
      dragX.interpolate({
        inputRange: [0, friction!],
        outputRange: [0, 1],
      })
    ).interpolate({
      inputRange: [-rightWidth - 1, -rightWidth, leftWidth, leftWidth + 1],
      outputRange: [
        -rightWidth - (overshootRight ? 1 / overshootFriction! : 0),
        -rightWidth,
        leftWidth,
        leftWidth + (overshootLeft ? 1 / overshootFriction! : 0),
      ],
    });
    transX = transX;
    showLeftAction =
      leftWidth > 0
        ? transX.interpolate({
            inputRange: [-1, 0, leftWidth],
            outputRange: [0, 0, 1],
          })
        : new Animated.Value(0);
    leftActionTranslate = showLeftAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [-10000, 0],
      extrapolate: 'clamp',
    });
    showRightAction =
      rightWidth > 0
        ? transX.interpolate({
            inputRange: [-rightWidth, 0, 1],
            outputRange: [1, 0, 0],
          })
        : new Animated.Value(0);
    rightActionTranslate = showRightAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [-10000, 0],
      extrapolate: 'clamp',
    });
  };

  const onTapHandlerStateChange = ({
    nativeEvent,
  }: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      close();
    }
  };

  const onHandlerStateChange = (
    ev: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      handleRelease(ev);
    }

    if (ev.nativeEvent.state === State.ACTIVE) {
      const { velocityX, translationX: dragX } = ev.nativeEvent;
      const { friction } = props;

      const translationX = (dragX + DRAG_TOSS * velocityX) / friction!;

      const direction =
        rowState === -1
          ? 'right'
          : rowState === 1
          ? 'left'
          : translationX > 0
          ? 'left'
          : 'right';

      if (rowState === 0) {
        props.onSwipeableOpenStartDrag?.(direction);
      } else {
        props.onSwipeableCloseStartDrag?.(direction);
      }
    }
  };

  const handleRelease = (
    ev: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    const { velocityX, translationX: dragX } = ev.nativeEvent;
    setLeftWidth(0);

    const { leftWidth = 0, rowWidth = 0, rowState } = state;
    const rightOffset = rowWidth;
    const rightWidth = rowWidth - rightOffset;
    const {
      friction,
      leftThreshold = leftWidth / 2,
      rightThreshold = rightWidth / 2,
    } = props;

    const startOffsetX = currentOffset() + dragX / friction!;
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

    animateRow(startOffsetX, toValue, velocityX / friction!);
  };

  const animateRow = (
    fromValue: number,
    toValue: number,
    velocityX?:
      | number
      | {
          x: number;
          y: number;
        }
  ) => {
    const { dragX, rowTranslation } = state;
    dragX.setValue(0);
    rowTranslation.setValue(fromValue);

    setState({ rowState: Math.sign(toValue) });
    Animated.spring(rowTranslation, {
      restSpeedThreshold: 1.7,
      restDisplacementThreshold: 0.4,
      velocity: velocityX,
      bounciness: 0,
      toValue,
      useNativeDriver: props.useNativeAnimations!,
      ...props.animationOptions,
    }).start(({ finished }) => {
      if (finished) {
        if (toValue > 0) {
          props.onSwipeableLeftOpen?.();
          props.onSwipeableOpen?.('left', this);
        } else if (toValue < 0) {
          props.onSwipeableRightOpen?.();
          props.onSwipeableOpen?.('right', this);
        } else {
          const closingDirection = fromValue > 0 ? 'left' : 'right';
          props.onSwipeableClose?.(closingDirection, this);
        }
      }
    });
    if (toValue > 0) {
      props.onSwipeableLeftWillOpen?.();
      props.onSwipeableWillOpen?.('left');
    } else if (toValue < 0) {
      props.onSwipeableRightWillOpen?.();
      props.onSwipeableWillOpen?.('right');
    } else {
      const closingDirection = fromValue > 0 ? 'left' : 'right';
      props.onSwipeableWillClose?.(closingDirection);
    }
  };

  const onRowLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    setState({ rowWidth: nativeEvent.layout.width });
  };

  const currentOffset = () => {
    const { leftWidth = 0, rowWidth = 0, rowState } = state;
    const { rightOffset = rowWidth } = state;
    const rightWidth = rowWidth - rightOffset;
    if (rowState === 1) {
      return leftWidth;
    } else if (rowState === -1) {
      return -rightWidth;
    }
    return 0;
  };

  close = () => {
    animateRow(currentOffset(), 0);
  };

  openLeft = () => {
    const { leftWidth = 0 } = state;
    animateRow(currentOffset(), leftWidth);
  };

  openRight = () => {
    const { rowWidth = 0 } = state;
    const { rightOffset = rowWidth } = state;
    const rightWidth = rowWidth - rightOffset;
    animateRow(currentOffset(), -rightWidth);
  };

  reset = () => {
    const { dragX, rowTranslation } = state;
    dragX.setValue(0);
    rowTranslation.setValue(0);
    setState({ rowState: 0 });
  };

  // RENDER() WAS HERE

  const { rowState } = state;
  const {
    children,
    renderLeftActions,
    renderRightActions,
    dragOffsetFromLeftEdge = 10,
    dragOffsetFromRightEdge = 10,
  } = props;

  const left = renderLeftActions && (
    <Animated.View
      style={[
        styles.leftActions,
        // all those and below parameters can have ! since they are all
        // asigned in constructor in `updateAnimatedEvent` but TS cannot spot
        // it for some reason
        { transform: [{ translateX: leftActionTranslate! }] },
      ]}>
      {renderLeftActions(showLeftAction!, transX!, this)}
      <View
        onLayout={({ nativeEvent }) =>
          setState({ leftWidth: nativeEvent.layout.x })
        }
      />
    </Animated.View>
  );

  const right = renderRightActions && (
    <Animated.View
      style={[
        styles.rightActions,
        { transform: [{ translateX: rightActionTranslate! }] },
      ]}>
      {renderRightActions(showRightAction!, transX!, this)}
      <View
        onLayout={({ nativeEvent }) =>
          setState({ rightOffset: nativeEvent.layout.x })
        }
      />
    </Animated.View>
  );

  const panGesture = Gesture.Tap()
  const tapGesture = Gesture.Tap()
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  return <>
    <GestureDetector gesture={composedGesture}>
    <Animated.View
        onLayout={onRowLayout}
        style={[styles.container, props.containerStyle]}>
        {left}
        {right}
        <Animated.View
          pointerEvents={rowState === 0 ? 'auto' : 'box-only'}
          style={[
            {
              transform: [{ translateX: transX! }],
            },
            props.childrenContainerStyle,
          ]}>
          {children}
        </Animated.View>
      </Animated.View>
    </GestureDetector>

    <PanGestureHandler
      activeOffsetX={[-dragOffsetFromRightEdge, dragOffsetFromLeftEdge]}
      touchAction="pan-y"
      {...props}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}>
        <TapGestureHandler
          enabled={rowState !== 0}
          touchAction="pan-y"
          onHandlerStateChange={onTapHandlerStateChange}>
        </TapGestureHandler>
    </PanGestureHandler>
    </>
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
