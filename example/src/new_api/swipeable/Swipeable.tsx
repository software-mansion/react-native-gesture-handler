// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us to
// move faster and fix possible issues quicker

import {
  ForwardedRef,
  LegacyRef,
  RefAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  PanGestureHandlerProps,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  ReduceMotion,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  I18nManager,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

const DRAG_TOSS = 0.05;

type SwipeableExcludes = Exclude<
  keyof PanGestureHandlerProps,
  'onGestureEvent' | 'onHandlerStateChange'
>;

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
  onSwipeableOpen?: (
    direction: 'left' | 'right',
    swipeable: ForwardedRef<SwipeableProps & RefAttributes<ExposedFunctions>>
  ) => void;

  /**
   * Called when action panel is closed.
   */
  onSwipeableClose?: (
    direction: 'left' | 'right',
    swipeable: ForwardedRef<SwipeableProps & RefAttributes<ExposedFunctions>>
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
    progressAnimatedValue: SharedValue,
    dragAnimatedValue: SharedValue,
    swipeable: ForwardedRef<SwipeableProps & RefAttributes<ExposedFunctions>> // we have to use ref here, as it now holds all the objects
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
    progressAnimatedValue: SharedValue,
    dragAnimatedValue: SharedValue,
    swipeable: ForwardedRef<SwipeableProps & RefAttributes<ExposedFunctions>>
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

export interface ExposedFunctions {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  reset: () => void;
}

const Swipeable = forwardRef<
  SwipeableProps & React.RefAttributes<ExposedFunctions>
>(function Swipeable(
  props: SwipeableProps,
  ref: ForwardedRef<SwipeableProps & RefAttributes<ExposedFunctions>>
) {
  const rowState = useSharedValue<number>(0);

  const dragX = useSharedValue<number>(0);
  const rowTranslation = useSharedValue<number>(0);
  const leftWidth = useSharedValue<number>(0);
  const rightOffset = useSharedValue<number>(0);
  const rowWidth = useSharedValue<number>(0);

  // todo: if things don't work, set all the default values from the original file
  // they are set everywhere thoughout this file, many functions set the default states themselves

  const defaultProps = {
    friction: 1,
    overshootFriction: 1,
    useNativeAnimations: true,
  };

  useEffect(() => {
    if (!props.friction) props.friction = defaultProps.friction;
    if (!props.overshootFriction)
      props.overshootFriction = defaultProps.overshootFriction;
    if (!props.useNativeAnimations)
      props.useNativeAnimations = defaultProps.useNativeAnimations;

    updateAnimatedEvent();
  }, []);

  /* todo: export to the exposed store
  
  const shouldComponentUpdate = (props: SwipeableProps) => {
    if (
      props.friction !== props.friction ||
      props.overshootLeft !== props.overshootLeft ||
      props.overshootRight !== props.overshootRight ||
      props.overshootFriction !== props.overshootFriction
    ) {
      updateAnimatedEvent(props);
      return true;
    }
    return false;
  };
  */

  const transX = useSharedValue(0); // only IV
  const showLeftAction = useSharedValue(0); // can AV
  const leftActionTranslate = useSharedValue(0); // only IV
  const showRightAction = useSharedValue(0); // can AV;
  const rightActionTranslate = useSharedValue(0); // only IV
  const composedX = useDerivedValue(() => rowTranslation.value + dragX.value);

  const updateAnimatedEvent = () => {
    const rightWidth = Math.max(0, rowWidth.value - rightOffset.value);

    const {
      friction,
      overshootFriction,
      overshootLeft = leftWidth.value > 0,
      overshootRight = rightWidth > 0,
    } = props;

    dragX.value = interpolate(dragX.value, [0, friction!], [0, 1]);

    transX.value = interpolate(
      composedX.value,
      [-rightWidth - 1, -rightWidth, leftWidth.value, leftWidth.value + 1],
      [
        -rightWidth - (overshootRight ? 1 / overshootFriction! : 0),
        -rightWidth,
        leftWidth.value,
        leftWidth.value + (overshootLeft ? 1 / overshootFriction! : 0),
      ]
    );

    showLeftAction.value =
      leftWidth.value > 0
        ? interpolate(transX.value, [-1, 0, leftWidth.value], [0, 0, 1])
        : 0;
    leftActionTranslate.value = interpolate(
      showLeftAction.value,
      [0, Number.MIN_VALUE],
      [-10000, 0],
      Extrapolation.CLAMP
    );
    showRightAction.value =
      rightWidth > 0
        ? interpolate(transX.value, [-rightWidth, 0, 1], [1, 0, 0])
        : 0;
    rightActionTranslate.value = interpolate(
      showRightAction.value,
      [0, Number.MIN_VALUE],
      [-10000, 0],
      Extrapolation.CLAMP
    );
  };

  const handleRelease = (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    const { velocityX, translationX: dragX } = event;

    // rightOffset default if undefined set to rowWidth.value
    const rightWidth = rowWidth.value - rightOffset.value;

    const {
      friction,
      leftThreshold = leftWidth.value / 2,
      rightThreshold = rightWidth / 2,
    } = props;

    const startOffsetX = currentOffset() + dragX / friction!;
    const translationX = (dragX + DRAG_TOSS * velocityX) / friction!;

    let toValue = 0;

    if (rowState.value === 0) {
      if (translationX > leftThreshold) {
        toValue = leftWidth.value;
      } else if (translationX < -rightThreshold) {
        toValue = -rightWidth;
      }
    } else if (rowState.value === 1) {
      // swiped to left
      if (translationX > -leftThreshold) {
        toValue = leftWidth.value;
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
    velocityX?: number
  ) => {
    dragX.value = 0;
    transX.value = fromValue;

    rowState.value = Math.sign(toValue);

    transX.value = withSpring(
      toValue,
      {
        duration: 1000,
        dampingRatio: 1.2,
        stiffness: 500,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        reduceMotion: ReduceMotion.System,
        velocity: velocityX,
        ...props.animationOptions,
      },
      (isFinished) => {
        if (isFinished) {
          if (toValue > 0) {
            props.onSwipeableLeftOpen?.();
            props.onSwipeableOpen?.('left', ref);
          } else if (toValue < 0) {
            props.onSwipeableRightOpen?.();
            props.onSwipeableOpen?.('right', ref);
          } else {
            const closingDirection = fromValue > 0 ? 'left' : 'right';
            props.onSwipeableClose?.(closingDirection, ref);
          }
        }
      }
    );

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
    rowWidth.value = nativeEvent.layout.width;
  };

  const currentOffset = () => {
    const rightWidth = rowWidth.value - rightOffset.value;
    if (rowState.value === 1) {
      return leftWidth.value;
    } else if (rowState.value === -1) {
      return -rightWidth;
    }
    return 0;
  };

  const {
    children,
    renderLeftActions,
    renderRightActions,
    dragOffsetFromLeftEdge = 10,
    dragOffsetFromRightEdge = 10,
  } = props;

  /* important but not crucial for now

  const onGestureEvent = Animated.event([
    { nativeEvent: { translationX: dragX } },
  ]);
 */

  const leftAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: leftActionTranslate.value,
        },
      ],
    };
  });

  const left = renderLeftActions && (
    <Animated.View style={[styles.leftActions, leftAnimatedStyle]}>
      {renderLeftActions(showLeftAction!, transX!, ref)}
      <View
        onLayout={({ nativeEvent }) => (leftWidth.value = nativeEvent.layout.x)}
      />
    </Animated.View>
  );

  const rightAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: rightActionTranslate.value,
        },
      ],
    };
  });

  const right = renderRightActions && (
    <Animated.View style={[styles.rightActions, rightAnimatedStyle]}>
      {renderRightActions(showRightAction!, transX!, ref)}
      <View
        onLayout={({ nativeEvent }) =>
          (rightOffset.value = nativeEvent.layout.x)
        }
      />
    </Animated.View>
  );

  const panGesture = Gesture.Pan();
  const tapGesture = Gesture.Tap();
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const close = () => {
    animateRow(currentOffset(), 0);
  };

  tapGesture.onEnd(() => {
    'worklet';
    close();
  });

  panGesture
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      'worklet';
      const { velocityX } = event;
      dragX.value = event.translationX;
      const { friction } = props;

      const translationX = (dragX.value + DRAG_TOSS * velocityX) / friction!;

      const direction =
        rowState.value === -1
          ? 'right'
          : rowState.value === 1
          ? 'left'
          : translationX > 0
          ? 'left'
          : 'right';
      if (rowState.value === 0) {
        props.onSwipeableOpenStartDrag?.(direction);
      } else {
        props.onSwipeableCloseStartDrag?.(direction);
      }

      updateAnimatedEvent();
    })
    .onEnd((event) => {
      'worklet';
      handleRelease(event);
    });

  panGesture.activeOffsetX([-dragOffsetFromRightEdge, dragOffsetFromLeftEdge]);
  tapGesture.enabled(rowState.value !== 0);
  tapGesture.shouldCancelWhenOutside(true);

  useImperativeHandle(
    ref,
    () => {
      return {
        close() {
          animateRow(currentOffset(), 0);
        },
        openLeft() {
          animateRow(currentOffset(), leftWidth.value);
        },
        openRight() {
          const rightWidth = rowWidth.value - rightOffset.value;
          animateRow(currentOffset(), -rightWidth);
        },
        reset() {
          dragX.value = 0;
          transX.value = 0;
          rowState.value = 0;
        },
      } as SwipeableProps & RefAttributes<ExposedFunctions>;
    },
    []
  );

  // note: during the dragging, we seem to not keeping track of all the changes
  // note: after dragging, we have no actual entrypoint to keep on updating after the end of the animation

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: transX.value! }],
    };
  });

  return (
    <Animated.View
      onLayout={onRowLayout}
      style={[styles.container, props.containerStyle]}>
      {left}
      {right}
      <GestureDetector gesture={composedGesture} touchAction="pan-y" {...props}>
        <Animated.View
          style={[
            animatedStyle,
            props.childrenContainerStyle,
            { pointerEvents: rowState.value === 0 ? 'auto' : 'box-only' },
          ]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
});

export default Swipeable;
export type SwipeableRef = LegacyRef<
  SwipeableProps & RefAttributes<ExposedFunctions>
>;

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