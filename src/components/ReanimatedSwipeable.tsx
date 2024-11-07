// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us to
// move faster and fix possible issues quicker

import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
} from 'react';
import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';
import {
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from '../handlers/gestureHandlerCommon';
import type { PanGestureHandlerProps } from '../handlers/PanGestureHandler';
import type { PanGestureHandlerEventPayload } from '../handlers/GestureHandlerEventPayload';
import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
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

enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

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
    direction: SwipeDirection.LEFT | SwipeDirection.RIGHT
  ) => void;

  /**
   * Called when action panel is closed.
   */
  onSwipeableClose?: (
    direction: SwipeDirection.LEFT | SwipeDirection.RIGHT
  ) => void;

  /**
   * Called when action panel starts animating on open (either right or left).
   */
  onSwipeableWillOpen?: (
    direction: SwipeDirection.LEFT | SwipeDirection.RIGHT
  ) => void;

  /**
   * Called when action panel starts animating on close.
   */
  onSwipeableWillClose?: (
    direction: SwipeDirection.LEFT | SwipeDirection.RIGHT
  ) => void;

  /**
   * Called when action panel starts being shown on dragging to open.
   */
  onSwipeableOpenStartDrag?: (
    direction: SwipeDirection.LEFT | SwipeDirection.RIGHT
  ) => void;

  /**
   * Called when action panel starts being shown on dragging to close.
   */
  onSwipeableCloseStartDrag?: (
    direction: SwipeDirection.LEFT | SwipeDirection.RIGHT
  ) => void;

  /**
   * `progress`: Equals `0` when `swipeable` is closed, `1` when `swipeable` is opened.
   *  - When the element overshoots it's opened position the value tends towards `Infinity`.
   *  - Goes back to `1` when `swipeable` is released.
   *
   * `translation`: a horizontal offset of the `swipeable` relative to its closed position.\
   * `swipeableMethods`: provides an object exposing methods for controlling the `swipeable`.
   *
   * To support `rtl` flexbox layouts use `flexDirection` styling.
   * */
  renderLeftActions?: (
    progress: SharedValue<number>,
    translation: SharedValue<number>,
    swipeableMethods: SwipeableMethods
  ) => React.ReactNode;

  /**
   * `progress`: Equals `0` when `swipeable` is closed, `1` when `swipeable` is opened.
   *  - When the element overshoots it's opened position the value tends towards `Infinity`.
   *  - Goes back to `1` when `swipeable` is released.
   *
   * `translation`: a horizontal offset of the `swipeable` relative to its closed position.\
   * `swipeableMethods`: provides an object exposing methods for controlling the `swipeable`.
   *
   * To support `rtl` flexbox layouts use `flexDirection` styling.
   * */
  renderRightActions?: (
    progress: SharedValue<number>,
    translation: SharedValue<number>,
    swipeableMethods: SwipeableMethods
  ) => React.ReactNode;

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
    const defaultProps = {
      friction: 1,
      overshootFriction: 1,
      dragOffset: 10,
      enableTrackpadTwoFingerGesture: false,
    };

    const {
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
      enableTrackpadTwoFingerGesture = defaultProps.enableTrackpadTwoFingerGesture,
      dragOffsetFromLeftEdge = defaultProps.dragOffset,
      dragOffsetFromRightEdge = defaultProps.dragOffset,
      friction = defaultProps.friction,
      overshootFriction = defaultProps.overshootFriction,
      onSwipeableOpenStartDrag,
      onSwipeableCloseStartDrag,
      onSwipeableWillOpen,
      onSwipeableWillClose,
      onSwipeableOpen,
      onSwipeableClose,
      renderLeftActions,
      renderRightActions,
      ...remainingProps
    } = props;

    const rowState = useSharedValue<number>(0);

    const userDrag = useSharedValue<number>(0);

    const appliedTranslation = useSharedValue<number>(0);

    const rowWidth = useSharedValue<number>(0);
    const leftWidth = useSharedValue<number>(0);
    const rightWidth = useSharedValue<number>(0);

    // used for synchronizing layout measurements between JS and UI
    const rightOffset = useSharedValue<number | null>(null);

    const showLeftProgress = useSharedValue<number>(0);
    const showRightProgress = useSharedValue<number>(0);

    const updateRightElementWidth = useCallback(() => {
      'worklet';
      if (rightOffset.value === null) {
        rightOffset.value = rowWidth.value;
      }
      rightWidth.value = Math.max(0, rowWidth.value - rightOffset.value);
    }, [rightOffset, rightWidth, rowWidth]);

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
          -rightWidth.value -
            (shouldOvershootRight ? 1 / overshootFriction : 0),
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
        if (toValue > 0 && onSwipeableWillOpen) {
          runOnJS(onSwipeableWillOpen)(SwipeDirection.RIGHT);
        } else if (toValue < 0 && onSwipeableWillOpen) {
          runOnJS(onSwipeableWillOpen)(SwipeDirection.LEFT);
        } else if (onSwipeableWillClose) {
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
        if (toValue > 0 && onSwipeableOpen) {
          runOnJS(onSwipeableOpen)(SwipeDirection.RIGHT);
        } else if (toValue < 0 && onSwipeableOpen) {
          runOnJS(onSwipeableOpen)(SwipeDirection.LEFT);
        } else if (onSwipeableClose) {
          runOnJS(onSwipeableClose)(
            fromValue > 0 ? SwipeDirection.LEFT : SwipeDirection.RIGHT
          );
        }
      },
      [onSwipeableClose, onSwipeableOpen]
    );

    const animateRow: (toValue: number, velocityX?: number) => void =
      useCallback(
        (toValue: number, velocityX?: number) => {
          'worklet';

          const translationSpringConfig = {
            duration: 1000,
            dampingRatio: 0.9,
            stiffness: 500,
            velocity: velocityX,
            overshootClamping: true,
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
              velocityX &&
              interpolate(velocityX, [-usedWidth, usedWidth], [-1, 1]),
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

          const progressTarget = toValue === 0 ? 0 : 1;

          showLeftProgress.value =
            leftWidth.value > 0
              ? withSpring(progressTarget, progressSpringConfig)
              : 0;
          showRightProgress.value =
            rightWidth.value > 0
              ? withSpring(progressTarget, progressSpringConfig)
              : 0;

          dispatchImmediateEvents(frozenRowState, toValue);

          rowState.value = Math.sign(toValue);
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

    const swipeableMethods = useMemo<SwipeableMethods>(
      () => ({
        close() {
          'worklet';
          animateRow(0);
        },
        openLeft() {
          'worklet';
          animateRow(leftWidth.value);
        },
        openRight() {
          'worklet';
          // rightOffset and rowWidth are already much sooner than rightWidth
          animateRow((rightOffset.value ?? 0) - rowWidth.value);
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
        leftWidth,
        rightOffset,
        rowWidth,
        userDrag,
        showLeftProgress,
        appliedTranslation,
        rowState,
        animateRow,
      ]
    );

    const onRowLayout = useCallback(
      ({ nativeEvent }: LayoutChangeEvent) => {
        rowWidth.value = nativeEvent.layout.width;
      },
      [rowWidth]
    );

    const leftElement = useCallback(
      () => (
        <Animated.View style={[styles.leftActions]}>
          {renderLeftActions?.(
            showLeftProgress,
            appliedTranslation,
            swipeableMethods
          )}
          <View
            onLayout={({ nativeEvent }) =>
              (leftWidth.value = nativeEvent.layout.x)
            }
          />
        </Animated.View>
      ),
      [
        appliedTranslation,
        leftWidth,
        renderLeftActions,
        showLeftProgress,
        swipeableMethods,
      ]
    );

    const rightElement = useCallback(
      () => (
        <Animated.View style={[styles.rightActions]}>
          {renderRightActions?.(
            showRightProgress,
            appliedTranslation,
            swipeableMethods
          )}
          <View
            onLayout={({ nativeEvent }) => {
              rightOffset.value = nativeEvent.layout.x;
            }}
          />
        </Animated.View>
      ),
      [
        appliedTranslation,
        renderRightActions,
        rightOffset,
        showRightProgress,
        swipeableMethods,
      ]
    );

    const handleRelease = useCallback(
      (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        'worklet';
        const { velocityX } = event;
        userDrag.value = event.translationX;

        updateRightElementWidth();

        const leftThresholdProp = leftThreshold ?? leftWidth.value / 2;
        const rightThresholdProp = rightThreshold ?? rightWidth.value / 2;

        const translationX =
          (userDrag.value + DRAG_TOSS * velocityX) / friction;

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
        updateRightElementWidth,
      ]
    );

    const close = useCallback(() => {
      'worklet';
      animateRow(0);
    }, [animateRow]);

    const dragStarted = useSharedValue<boolean>(false);

    const tapGesture = useMemo(
      () =>
        Gesture.Tap()
          .shouldCancelWhenOutside(true)
          .onStart(() => {
            if (rowState.value !== 0) {
              close();
            }
          }),
      [close, rowState]
    );

    const panGesture = useMemo(
      () =>
        Gesture.Pan()
          .enabled(enabled !== false)
          .enableTrackpadTwoFingerGesture(enableTrackpadTwoFingerGesture)
          .activeOffsetX([-dragOffsetFromRightEdge, dragOffsetFromLeftEdge])
          .onStart(() => {
            updateRightElementWidth();
          })
          .onUpdate(
            (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
              userDrag.value = event.translationX;

              const direction =
                rowState.value === -1
                  ? SwipeDirection.RIGHT
                  : rowState.value === 1
                  ? SwipeDirection.LEFT
                  : event.translationX > 0
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
            }
          )
          .onEnd(
            (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
              handleRelease(event);
            }
          )
          .onFinalize(() => {
            dragStarted.value = false;
          }),
      [
        dragOffsetFromLeftEdge,
        dragOffsetFromRightEdge,
        dragStarted,
        enableTrackpadTwoFingerGesture,
        enabled,
        handleRelease,
        onSwipeableCloseStartDrag,
        onSwipeableOpenStartDrag,
        rowState,
        updateAnimatedEvent,
        updateRightElementWidth,
        userDrag,
      ]
    );

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
