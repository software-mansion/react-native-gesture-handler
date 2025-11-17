import { useMemo, useCallback, useImperativeHandle, ForwardedRef } from 'react';
import { LayoutChangeEvent, View, I18nManager, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  interpolate,
  runOnJS,
  ReduceMotion,
  withSpring,
  useAnimatedRef,
  measure,
  runOnUI,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  SwipeableProps,
  SwipeableMethods,
  SwipeDirection,
} from './ReanimatedSwipeableProps';
import {
  PanGestureStateChangeEvent,
  PanGestureUpdateEvent,
  usePan,
  useTap,
} from '../../v3/hooks/gestures';
import { GestureDetector } from '../../v3/detectors';

const DRAG_TOSS = 0.05;

const DEFAULT_FRICTION = 1;
const DEFAULT_OVERSHOOT_FRICTION = 1;
const DEFAULT_DRAG_OFFSET = 10;
const DEFAULT_ENABLE_TRACKING_TWO_FINGER_GESTURE = false;

const Swipeable = (props: SwipeableProps) => {
  const {
    ref,
    leftThreshold,
    rightThreshold,
    enabled,
    containerStyle,
    childrenContainerStyle,
    animationOptions,
    overshootLeft,
    overshootRight,
    testID,
    children,
    enableTrackpadTwoFingerGesture = DEFAULT_ENABLE_TRACKING_TWO_FINGER_GESTURE,
    dragOffsetFromLeftEdge = DEFAULT_DRAG_OFFSET,
    dragOffsetFromRightEdge = DEFAULT_DRAG_OFFSET,
    friction = DEFAULT_FRICTION,
    overshootFriction = DEFAULT_OVERSHOOT_FRICTION,
    onSwipeableOpenStartDrag,
    onSwipeableCloseStartDrag,
    onSwipeableWillOpen,
    onSwipeableWillClose,
    onSwipeableOpen,
    onSwipeableClose,
    renderLeftActions,
    renderRightActions,
    simultaneousWithExternalGesture,
    requireExternalGestureToFail,
    blocksExternalGesture,
    hitSlop,
    ...remainingProps
  } = props;

  const shouldEnableTap = useSharedValue<boolean>(false);
  const rowState = useSharedValue<number>(0);

  const userDrag = useSharedValue<number>(0);

  const appliedTranslation = useSharedValue<number>(0);

  const rowWidth = useSharedValue<number>(0);
  const leftWidth = useSharedValue<number>(0);
  const rightWidth = useSharedValue<number>(0);

  const showLeftProgress = useSharedValue<number>(0);
  const showRightProgress = useSharedValue<number>(0);

  const updateAnimatedEvent = useCallback(() => {
    'worklet';

    const shouldOvershootLeft = overshootLeft ?? leftWidth.value > 0;
    const shouldOvershootRight = overshootRight ?? rightWidth.value > 0;

    const startOffset =
      rowState.value === 1
        ? leftWidth.value
        : rowState.value === -1
          ? -rightWidth.value
          : 0;

    const offsetDrag = userDrag.value / friction + startOffset;

    appliedTranslation.value = interpolate(
      offsetDrag,
      [
        -rightWidth.value - 1,
        -rightWidth.value,
        leftWidth.value,
        leftWidth.value + 1,
      ],
      [
        -rightWidth.value - (shouldOvershootRight ? 1 / overshootFriction : 0),
        -rightWidth.value,
        leftWidth.value,
        leftWidth.value + (shouldOvershootLeft ? 1 / overshootFriction : 0),
      ]
    );

    showLeftProgress.value =
      leftWidth.value > 0
        ? interpolate(
            appliedTranslation.value,
            [-1, 0, leftWidth.value],
            [0, 0, 1]
          )
        : 0;

    showRightProgress.value =
      rightWidth.value > 0
        ? interpolate(
            appliedTranslation.value,
            [-rightWidth.value, 0, 1],
            [1, 0, 0]
          )
        : 0;
  }, [
    appliedTranslation,
    friction,
    leftWidth,
    overshootFriction,
    rightWidth,
    rowState,
    showLeftProgress,
    showRightProgress,
    userDrag,
    overshootLeft,
    overshootRight,
  ]);

  const dispatchImmediateEvents = useCallback(
    (fromValue: number, toValue: number) => {
      'worklet';

      if (onSwipeableWillOpen && toValue !== 0) {
        runOnJS(onSwipeableWillOpen)(
          toValue > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT
        );
      }

      if (onSwipeableWillClose && toValue === 0) {
        runOnJS(onSwipeableWillClose)(
          fromValue > 0 ? SwipeDirection.LEFT : SwipeDirection.RIGHT
        );
      }
    },
    [onSwipeableWillClose, onSwipeableWillOpen]
  );

  const dispatchEndEvents = useCallback(
    (fromValue: number, toValue: number) => {
      'worklet';

      if (onSwipeableOpen && toValue !== 0) {
        runOnJS(onSwipeableOpen)(
          toValue > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT
        );
      }

      if (onSwipeableClose && toValue === 0) {
        runOnJS(onSwipeableClose)(
          fromValue > 0 ? SwipeDirection.LEFT : SwipeDirection.RIGHT
        );
      }
    },
    [onSwipeableClose, onSwipeableOpen]
  );

  const animateRow: (toValue: number, velocityX?: number) => void = useCallback(
    (toValue: number, velocityX?: number) => {
      'worklet';

      const translationSpringConfig = {
        mass: 2,
        damping: 1000,
        stiffness: 700,
        velocity: velocityX,
        overshootClamping: true,
        reduceMotion: ReduceMotion.System,
        ...animationOptions,
      };

      const isClosing = toValue === 0;
      const moveToRight = isClosing ? rowState.value < 0 : toValue > 0;

      const usedWidth = isClosing
        ? moveToRight
          ? rightWidth.value
          : leftWidth.value
        : moveToRight
          ? leftWidth.value
          : rightWidth.value;

      const progressSpringConfig = {
        ...translationSpringConfig,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        velocity:
          velocityX && interpolate(velocityX, [-usedWidth, usedWidth], [-1, 1]),
      };

      const frozenRowState = rowState.value;

      appliedTranslation.value = withSpring(
        toValue,
        translationSpringConfig,
        (isFinished) => {
          if (isFinished) {
            dispatchEndEvents(frozenRowState, toValue);
          }
        }
      );

      const progressTarget = toValue === 0 ? 0 : 1 * Math.sign(toValue);

      showLeftProgress.value = withSpring(
        Math.max(progressTarget, 0),
        progressSpringConfig
      );

      showRightProgress.value = withSpring(
        Math.max(-progressTarget, 0),
        progressSpringConfig
      );

      dispatchImmediateEvents(frozenRowState, toValue);

      rowState.value = Math.sign(toValue);

      shouldEnableTap.value = rowState.value !== 0;
    },
    [
      rowState,
      animationOptions,
      appliedTranslation,
      showLeftProgress,
      leftWidth,
      showRightProgress,
      rightWidth,
      dispatchImmediateEvents,
      dispatchEndEvents,
    ]
  );

  const leftLayoutRef = useAnimatedRef();
  const leftWrapperLayoutRef = useAnimatedRef();
  const rightLayoutRef = useAnimatedRef();

  const updateElementWidths = useCallback(() => {
    'worklet';
    const leftLayout = measure(leftLayoutRef);
    const leftWrapperLayout = measure(leftWrapperLayoutRef);
    const rightLayout = measure(rightLayoutRef);
    leftWidth.value =
      (leftLayout?.pageX ?? 0) - (leftWrapperLayout?.pageX ?? 0);

    rightWidth.value =
      rowWidth.value -
      (rightLayout?.pageX ?? rowWidth.value) +
      (leftWrapperLayout?.pageX ?? 0);
  }, [
    leftLayoutRef,
    leftWrapperLayoutRef,
    rightLayoutRef,
    leftWidth,
    rightWidth,
    rowWidth,
  ]);

  const swipeableMethods = useMemo<SwipeableMethods>(
    () => ({
      close() {
        'worklet';
        if (_WORKLET) {
          animateRow(0);
          return;
        }
        runOnUI(() => {
          animateRow(0);
        })();
      },
      openLeft() {
        'worklet';
        if (_WORKLET) {
          updateElementWidths();
          animateRow(leftWidth.value);
          return;
        }
        runOnUI(() => {
          updateElementWidths();
          animateRow(leftWidth.value);
        })();
      },
      openRight() {
        'worklet';
        if (_WORKLET) {
          updateElementWidths();
          animateRow(-rightWidth.value);
          return;
        }
        runOnUI(() => {
          updateElementWidths();
          animateRow(-rightWidth.value);
        })();
      },
      reset() {
        'worklet';
        userDrag.value = 0;
        showLeftProgress.value = 0;
        appliedTranslation.value = 0;
        rowState.value = 0;
      },
    }),
    [
      animateRow,
      updateElementWidths,
      leftWidth,
      rightWidth,
      userDrag,
      showLeftProgress,
      appliedTranslation,
      rowState,
    ]
  );

  const onRowLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      rowWidth.value = nativeEvent.layout.width;
    },
    [rowWidth]
  );

  // As stated in `Dimensions.get` docstring, this function should be called on every render
  // since dimensions may change (e.g. orientation change)

  const leftActionAnimation = useAnimatedStyle(() => {
    return {
      opacity: showLeftProgress.value === 0 ? 0 : 1,
    };
  });

  const leftElement = useCallback(
    () => (
      <Animated.View
        ref={leftWrapperLayoutRef}
        style={[styles.leftActions, leftActionAnimation]}>
        {renderLeftActions?.(
          showLeftProgress,
          appliedTranslation,
          swipeableMethods
        )}
        <Animated.View ref={leftLayoutRef} />
      </Animated.View>
    ),
    [
      appliedTranslation,
      leftActionAnimation,
      leftLayoutRef,
      leftWrapperLayoutRef,
      renderLeftActions,
      showLeftProgress,
      swipeableMethods,
    ]
  );

  const rightActionAnimation = useAnimatedStyle(() => {
    return {
      opacity: showRightProgress.value === 0 ? 0 : 1,
    };
  });

  const rightElement = useCallback(
    () => (
      <Animated.View style={[styles.rightActions, rightActionAnimation]}>
        {renderRightActions?.(
          showRightProgress,
          appliedTranslation,
          swipeableMethods
        )}
        <Animated.View ref={rightLayoutRef} />
      </Animated.View>
    ),
    [
      appliedTranslation,
      renderRightActions,
      rightActionAnimation,
      rightLayoutRef,
      showRightProgress,
      swipeableMethods,
    ]
  );

  const handleRelease = useCallback(
    (event: PanGestureStateChangeEvent) => {
      'worklet';
      const { velocityX } = event.handlerData;
      userDrag.value = event.handlerData.translationX;

      const leftThresholdProp = leftThreshold ?? leftWidth.value / 2;
      const rightThresholdProp = rightThreshold ?? rightWidth.value / 2;

      const translationX = (userDrag.value + DRAG_TOSS * velocityX) / friction;

      let toValue = 0;

      if (rowState.value === 0) {
        if (translationX > leftThresholdProp) {
          toValue = leftWidth.value;
        } else if (translationX < -rightThresholdProp) {
          toValue = -rightWidth.value;
        }
      } else if (rowState.value === 1) {
        // Swiped to left
        if (translationX > -leftThresholdProp) {
          toValue = leftWidth.value;
        }
      } else {
        // Swiped to right
        if (translationX < rightThresholdProp) {
          toValue = -rightWidth.value;
        }
      }

      animateRow(toValue, velocityX / friction);
    },
    [
      animateRow,
      friction,
      leftThreshold,
      leftWidth,
      rightThreshold,
      rightWidth,
      rowState,
      userDrag,
    ]
  );

  const close = useCallback(() => {
    'worklet';
    animateRow(0);
  }, [animateRow]);

  const dragStarted = useSharedValue<boolean>(false);

  const tapGesture = useTap({
    shouldCancelWhenOutside: true,
    enabled: shouldEnableTap,
    simultaneousWith: simultaneousWithExternalGesture,
    requireToFail: requireExternalGestureToFail,
    block: blocksExternalGesture,
    onStart: () => {
      'worklet';
      if (rowState.value !== 0) {
        close();
      }
    },
  });

  const panGesture = usePan({
    enabled: enabled !== false,
    enableTrackpadTwoFingerGesture: enableTrackpadTwoFingerGesture,
    activeOffsetX: [-dragOffsetFromRightEdge, dragOffsetFromLeftEdge],
    simultaneousWith: simultaneousWithExternalGesture,
    requireToFail: requireExternalGestureToFail,
    block: blocksExternalGesture,
    onStart: updateElementWidths,
    onUpdate: (event: PanGestureUpdateEvent) => {
      'worklet';
      userDrag.value = event.handlerData.translationX;

      const direction =
        rowState.value === -1
          ? SwipeDirection.RIGHT
          : rowState.value === 1
            ? SwipeDirection.LEFT
            : event.handlerData.translationX > 0
              ? SwipeDirection.RIGHT
              : SwipeDirection.LEFT;

      if (!dragStarted.value) {
        dragStarted.value = true;
        if (rowState.value === 0 && onSwipeableOpenStartDrag) {
          runOnJS(onSwipeableOpenStartDrag)(direction);
        } else if (onSwipeableCloseStartDrag) {
          runOnJS(onSwipeableCloseStartDrag)(direction);
        }
      }

      updateAnimatedEvent();
    },
    onEnd: (event: PanGestureStateChangeEvent) => {
      'worklet';
      handleRelease(event);
    },
    onFinalize: () => {
      'worklet';
      dragStarted.value = false;
    },
  });

  useImperativeHandle(ref, () => swipeableMethods, [swipeableMethods]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: appliedTranslation.value }],
      pointerEvents: rowState.value === 0 ? 'auto' : 'box-only',
    }),
    [appliedTranslation, rowState]
  );

  const swipeableComponent = (
    <GestureDetector gesture={panGesture} touchAction="pan-y">
      <Animated.View
        {...remainingProps}
        onLayout={onRowLayout}
        hitSlop={hitSlop ?? undefined}
        style={[styles.container, containerStyle]}>
        {leftElement()}
        {rightElement()}
        <GestureDetector gesture={tapGesture} touchAction="pan-y">
          <Animated.View style={[animatedStyle, childrenContainerStyle]}>
            {children}
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  );

  return testID ? (
    <View testID={testID}>{swipeableComponent}</View>
  ) : (
    swipeableComponent
  );
};

export default Swipeable;
export type SwipeableRef = ForwardedRef<SwipeableMethods>;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  leftActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    overflow: 'hidden',
  },
  rightActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    overflow: 'hidden',
  },
});
