// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us to
// move faster and fix possible issues quicker

import {
  ForwardedRef,
  RefAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
  PanGestureHandlerProps,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useDerivedValue,
  useFrameCallback,
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
  const [rowState, setRowState] = useState<number>(0);

  const dragX = useSharedValue<number>(0);
  const rowTranslation = useSharedValue<number>(0);
  const [leftWidth, setLeftWidth] = useState<number>(0);
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

    updateAnimatedEvent(props);
  }, []);

  useEffect(() => {
    updateAnimatedEvent(props);
  }, [leftWidth, rightOffset, rowWidth]);

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

  const updateAnimatedEvent = (props: SwipeableProps) => {
    const rightWidth = Math.max(0, rowWidth.value - rightOffset.value);

    const {
      friction,
      overshootFriction,
      overshootLeft = leftWidth > 0,
      overshootRight = rightWidth > 0,
    } = props;

    dragX.value = interpolate(dragX.value, [0, friction!], [0, 1]);

    transX.value = interpolate(
      composedX.value,
      [-rightWidth - 1, -rightWidth, leftWidth, leftWidth + 1],
      [
        -rightWidth - (overshootRight ? 1 / overshootFriction! : 0),
        -rightWidth,
        leftWidth,
        leftWidth + (overshootLeft ? 1 / overshootFriction! : 0),
      ]
    );

    showLeftAction.value =
      leftWidth > 0
        ? interpolate(transX.value, [-1, 0, leftWidth], [0, 0, 1])
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

    console.log('handling');

    // rightOffset default if undefined set to rowWidth.value
    const rightWidth = rowWidth.value - rightOffset.value;

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
    velocityX?: number
  ) => {
    dragX.value = 0;
    rowTranslation.value = fromValue;

    setRowState(Math.sign(toValue));

    rowTranslation.value = withSpring(
      toValue,
      {
        restSpeedThreshold: 1.7,
        restDisplacementThreshold: 0.4,
        velocity: velocityX,
        damping: 1,
        ...props.animationOptions,
      },
      () => {
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
    if (rowState === 1) {
      return leftWidth;
    } else if (rowState === -1) {
      return -rightWidth;
    }
    return 0;
  };

  const close = () => {
    animateRow(currentOffset(), 0);
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

  const left = renderLeftActions && (
    <Animated.View
      style={[
        styles.leftActions,
        // all those and below parameters can have ! since they are all
        // asigned in constructor in `updateAnimatedEvent` but TS cannot spot
        // it for some reason
        { transform: [{ translateX: leftActionTranslate! }] },
      ]}>
      {renderLeftActions(showLeftAction!, transX!, ref)}
      <View
        onLayout={({ nativeEvent }) => setLeftWidth(nativeEvent.layout.x)}
      />
    </Animated.View>
  );

  const right = renderRightActions && (
    <Animated.View
      style={[
        styles.rightActions,
        { transform: [{ translateX: rightActionTranslate! }] },
      ]}>
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

  tapGesture.onStart(() => {
    close();
  });

  panGesture.onFinalize(
    (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      handleRelease(event);
    }
  );

  panGesture.onStart(
    (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      const { velocityX } = event;
      dragX.value = event.translationX;
      const { friction } = props;

      console.log('dragX:', dragX);

      const translationX = (dragX.value + DRAG_TOSS * velocityX) / friction!;

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
  );

  panGesture.activeOffsetX([-dragOffsetFromRightEdge, dragOffsetFromLeftEdge]);
  tapGesture.enabled(rowState !== 0);

  useImperativeHandle(
    ref,
    () => {
      return {
        close() {
          animateRow(currentOffset(), 0);
        },
        openLeft() {
          animateRow(currentOffset(), leftWidth);
        },
        openRight() {
          const rightWidth = rowWidth.value - rightOffset.value;
          animateRow(currentOffset(), -rightWidth);
        },
        reset() {
          dragX.value = 0;
          rowTranslation.value = 0;
          setRowState(0);
        },
      } as SwipeableProps & RefAttributes<ExposedFunctions>;
    },
    []
  );

  // note: key to success now is activating updateAnimatedEvent(props); every frame of the animation
  //       where'd be a viable entry point for that?

  useFrameCallback(() => {
    updateAnimatedEvent(props);
  });

  return (
    <GestureDetector gesture={composedGesture} touchAction="pan-y" {...props}>
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
  );
});

export default Swipeable;

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
