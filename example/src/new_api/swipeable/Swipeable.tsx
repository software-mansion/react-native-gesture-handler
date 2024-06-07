'use strict';
// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us to
// move faster and fix possible issues quicker

import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
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
   * Called when action panel gets open (either right or left).
   */
  onSwipeableOpen?: (
    direction: 'left' | 'right',
    swipeable: SwipeableMethods
  ) => void;

  /**
   * Called when action panel is closed.
   */
  onSwipeableClose?: (
    direction: 'left' | 'right',
    swipeable: SwipeableMethods
  ) => void;

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
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods // we have to use ref here, as it now holds all the objects
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
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods
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

export interface SwipeableMethods {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  reset: () => void;
}

const Swipeable = forwardRef<SwipeableMethods, SwipeableProps>(
  function Swipeable(
    props: SwipeableProps,
    ref: ForwardedRef<SwipeableMethods>
  ) {
    const rowState = useSharedValue<number>(0);

    const dragX = useSharedValue<number>(0);
    const rowTranslation = useSharedValue<number>(0);
    const leftWidth = useSharedValue<number>(0);
    const rightOffset = useSharedValue<number>(0);
    const rowWidth = useSharedValue<number>(0);

    const swipeableMethods = useMemo<SwipeableMethods>(
      () => ({
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
      }),
      []
    );

    const defaultProps = {
      friction: 1,
      overshootFriction: 1,
    };

    const [friction] = useState(props.friction ?? defaultProps.friction);
    const [overshootFriction] = useState(
      props.overshootFriction ?? defaultProps.overshootFriction
    );

    /* todo: export to the exposed store
  
    const shouldComponentUpdate = (props: SwipeableProps) => {
      if (
        friction !== friction ||
        props.overshootLeft !== props.overshootLeft ||
        props.overshootRight !== props.overshootRight ||
        overshootFriction !== overshootFriction
      ) {
        updateAnimatedEvent(props);
        return true;
      }
      return false;
    };
    */

    const transX = useSharedValue(0);
    const showLeftAction = useSharedValue(0);
    const leftActionTranslate = useSharedValue(0);
    const showRightAction = useSharedValue(0);
    const rightActionTranslate = useSharedValue(0);
    const composedX = useDerivedValue(() => rowTranslation.value + dragX.value);

    const currentOffset = () => {
      'worklet';
      const rightWidth = rowWidth.value - rightOffset.value;
      if (rowState.value === 1) {
        return leftWidth.value;
      } else if (rowState.value === -1) {
        return -rightWidth;
      }
      return 0;
    };

    const updateAnimatedEvent = () => {
      'worklet';
      const rightWidth = Math.max(0, rowWidth.value - rightOffset.value);

      const {
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

    useEffect(() => {
      updateAnimatedEvent();
    }, []);

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
          velocity: velocityX,
          ...props.animationOptions,
        },
        (isFinished) => {
          if (isFinished) {
            if (toValue > 0) {
              props.onSwipeableOpen?.('left', swipeableMethods);
            } else if (toValue < 0) {
              props.onSwipeableOpen?.('right', swipeableMethods);
            } else {
              const closingDirection = fromValue > 0 ? 'left' : 'right';
              props.onSwipeableClose?.(closingDirection, swipeableMethods);
            }
          }
        }
      );

      if (toValue > 0) {
        props.onSwipeableWillOpen?.('left');
      } else if (toValue < 0) {
        props.onSwipeableWillOpen?.('right');
      } else {
        const closingDirection = fromValue > 0 ? 'left' : 'right';
        props.onSwipeableWillClose?.(closingDirection);
      }
    };

    const handleRelease = (
      event: GestureStateChangeEvent<PanGestureHandlerEventPayload>
    ) => {
      'worklet';
      const { velocityX, translationX: dragX } = event;

      const rightWidth = rowWidth.value - rightOffset.value;

      const {
        leftThreshold = leftWidth.value / 2,
        rightThreshold = rightWidth / 2,
      } = props;

      const startOffsetX = currentOffset() + dragX / friction;
      const translationX = (dragX + DRAG_TOSS * velocityX) / friction;

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

      animateRow(startOffsetX, toValue, velocityX / friction);
    };

    const onRowLayout = ({ nativeEvent }: LayoutChangeEvent) => {
      rowWidth.value = nativeEvent.layout.width;
    };

    const {
      children,
      renderLeftActions,
      renderRightActions,
      dragOffsetFromLeftEdge = 10,
      dragOffsetFromRightEdge = 10,
    } = props;

    /* important but not crucial for now
      todo:
      const onGestureEvent = Animated.event([
        { nativeEvent: { translationX: dragX } },
      ]);
    */

    const leftAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: leftActionTranslate.value,
        },
      ],
    }));

    const left = renderLeftActions && (
      <Animated.View style={[styles.leftActions, leftAnimatedStyle]}>
        {renderLeftActions(showLeftAction, transX, swipeableMethods)}
        <View
          onLayout={({ nativeEvent }) =>
            (leftWidth.value = nativeEvent.layout.x)
          }
        />
      </Animated.View>
    );

    const rightAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: rightActionTranslate.value,
        },
      ],
    }));

    const right = renderRightActions && (
      <Animated.View style={[styles.rightActions, rightAnimatedStyle]}>
        {renderRightActions(showRightAction, transX, swipeableMethods)}
        <View
          onLayout={({ nativeEvent }) =>
            (rightOffset.value = nativeEvent.layout.x)
          }
        />
      </Animated.View>
    );

    const close = () => {
      animateRow(currentOffset(), 0);
    };

    const tapGesture = Gesture.Tap().onEnd(() => {
      close();
    });

    const panGesture = Gesture.Pan()
      .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
        const { velocityX } = event;
        dragX.value = event.translationX;

        const translationX = (dragX.value + DRAG_TOSS * velocityX) / friction;

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
        handleRelease(event);
      });

    panGesture.activeOffsetX([
      -dragOffsetFromRightEdge,
      dragOffsetFromLeftEdge,
    ]);
    tapGesture.enabled(rowState.value !== 0);
    tapGesture.shouldCancelWhenOutside(true);

    useImperativeHandle(ref, () => swipeableMethods, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: transX.value }],
    }));

    const composedGesture = Gesture.Race(panGesture, tapGesture);

    return (
      <Animated.View
        onLayout={onRowLayout}
        style={[styles.container, props.containerStyle]}>
        {left}
        {right}
        <GestureDetector
          gesture={composedGesture}
          touchAction="pan-y"
          {...props}>
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
  }
);

export default Swipeable;
export type SwipeableRef = ForwardedRef<SwipeableMethods>;

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
