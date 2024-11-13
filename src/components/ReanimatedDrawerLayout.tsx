// This component is based on RN's DrawerLayoutAndroid API
// It's cross-compatible with all platforms despite
// `DrawerLayoutAndroid` only being available on android

import React, {
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import {
  StyleSheet,
  Keyboard,
  StatusBar,
  I18nManager,
  StatusBarAnimation,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  Platform,
} from 'react-native';

import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';
import {
  UserSelect,
  ActiveCursor,
  MouseButton,
  HitSlop,
  GestureStateChangeEvent,
} from '../handlers/gestureHandlerCommon';
import { PanGestureHandlerEventPayload } from '../handlers/GestureHandlerEventPayload';

const DRAG_TOSS = 0.05;

export enum DrawerPosition {
  LEFT,
  RIGHT,
}

export enum DrawerState {
  IDLE,
  DRAGGING,
  SETTLING,
}

export enum DrawerType {
  FRONT,
  BACK,
  SLIDE,
}

export enum DrawerLockMode {
  UNLOCKED,
  LOCKED_CLOSED,
  LOCKED_OPEN,
}

export enum DrawerKeyboardDismissMode {
  NONE,
  ON_DRAG,
}

export interface DrawerLayoutProps {
  /**
   * This attribute is present in the native android implementation already and is one
   * of the required params. The gesture handler version of DrawerLayout makes it
   * possible for the function passed as `renderNavigationView` to take an
   * Animated value as a parameter that indicates the progress of drawer
   * opening/closing animation (progress value is 0 when closed and 1 when
   * opened). This can be used by the drawer component to animated its children
   * while the drawer is opening or closing.
   */
  renderNavigationView: (
    progressAnimatedValue: SharedValue<number>
  ) => ReactNode;

  /**
   * Determines the side from which the drawer will open.
   */
  drawerPosition?: DrawerPosition;

  /**
   * Width of the drawer.
   */
  drawerWidth?: number;

  /**
   * Background color of the drawer.
   */
  drawerBackgroundColor?: string;

  /**
   * Specifies the lock mode of the drawer.
   * Programatic opening/closing isn't affected by the lock mode. Defaults to `UNLOCKED`.
   * - `UNLOCKED` - the drawer will respond to gestures.
   * - `LOCKED_CLOSED` - the drawer will move freely until it settles in a closed position, then the gestures will be disabled.
   * - `LOCKED_OPEN` - the drawer will move freely until it settles in an opened position, then the gestures will be disabled.
   */
  drawerLockMode?: DrawerLockMode;

  /**
   * Determines if system keyboard should be closed upon dragging the drawer.
   */
  keyboardDismissMode?: DrawerKeyboardDismissMode;

  /**
   * Called when the drawer is closed.
   */
  onDrawerClose?: () => void;

  /**
   * Called when the drawer is opened.
   */
  onDrawerOpen?: () => void;

  /**
   * Called when the status of the drawer changes.
   */
  onDrawerStateChanged?: (
    newState: DrawerState,
    drawerWillShow: boolean
  ) => void;

  /**
   * Type of animation that will play when opening the drawer.
   */
  drawerType?: DrawerType;

  /**
   * Defines how far from the edge of the content view the gesture should
   * activate.
   */
  edgeWidth?: number;

  /**
   * Minimal distance to swipe before the drawer starts moving.
   */
  minSwipeDistance?: number;

  /**
   * When set to true Drawer component will use
   * {@link https://reactnative.dev/docs/statusbar StatusBar} API to hide the OS
   * status bar whenever the drawer is pulled or when its in an "open" state.
   */
  hideStatusBar?: boolean;

  /**
   * @default 'slide'
   *
   * Can be used when hideStatusBar is set to true and will select the animation
   * used for hiding/showing the status bar. See
   * {@link https://reactnative.dev/docs/statusbar StatusBar} documentation for
   * more details
   */
  statusBarAnimation?: StatusBarAnimation;

  /**
   * @default 'rgba(0, 0, 0, 0.7)'
   *
   * Color of the background overlay.
   * Animated from `0%` to `100%` as the drawer opens.
   */
  overlayColor?: string;

  /**
   * Style wrapping the content.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Style wrapping the drawer.
   */
  drawerContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Enables two-finger gestures on supported devices, for example iPads with
   * trackpads. If not enabled the gesture will require click + drag, with
   * `enableTrackpadTwoFingerGesture` swiping with two fingers will also trigger
   * the gesture.
   */
  enableTrackpadTwoFingerGesture?: boolean;

  onDrawerSlide?: (position: number) => void;

  // Implicit `children` prop has been removed in @types/react^18.0.
  /**
   * Elements that will be rendered inside the content view.
   */
  children?: ReactNode | ((openValue?: SharedValue<number>) => ReactNode);

  /**
   * @default 'none'
   * Sets whether the text inside both the drawer and the context window can be selected.
   * Values: 'none' | 'text' | 'auto'
   */
  userSelect?: UserSelect;

  /**
   * @default 'auto'
   * Sets the displayed cursor pictogram when the drawer is being dragged.
   * Values: see CSS cursor values
   */
  activeCursor?: ActiveCursor;

  /**
   * @default 'MouseButton.LEFT'
   * Allows to choose which mouse button should underlying pan handler react to.
   */
  mouseButton?: MouseButton;

  /**
   * @default 'false if MouseButton.RIGHT is specified'
   * Allows to enable/disable context menu.
   */
  enableContextMenu?: boolean;
}

export type DrawerMovementOption = {
  initialVelocity?: number;
  animationSpeed?: number;
};

export interface DrawerLayoutMethods {
  openDrawer: (options?: DrawerMovementOption) => void;
  closeDrawer: (options?: DrawerMovementOption) => void;
}

const defaultProps = {
  drawerWidth: 200,
  drawerPosition: DrawerPosition.LEFT,
  drawerType: DrawerType.FRONT,
  edgeWidth: 20,
  minSwipeDistance: 3,
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  drawerLockMode: DrawerLockMode.UNLOCKED,
  enableTrackpadTwoFingerGesture: false,
  activeCursor: 'auto' as ActiveCursor,
  mouseButton: MouseButton.LEFT,
  statusBarAnimation: 'slide' as StatusBarAnimation,
};

const DrawerLayout = forwardRef<DrawerLayoutMethods, DrawerLayoutProps>(
  function DrawerLayout(props: DrawerLayoutProps, ref) {
    const [containerWidth, setContainerWidth] = useState(0);
    const [drawerState, setDrawerState] = useState<DrawerState>(
      DrawerState.IDLE
    );
    const [drawerOpened, setDrawerOpened] = useState(false);

    const {
      drawerPosition = defaultProps.drawerPosition,
      drawerWidth = defaultProps.drawerWidth,
      drawerType = defaultProps.drawerType,
      drawerBackgroundColor,
      drawerContainerStyle,
      contentContainerStyle,
      minSwipeDistance = defaultProps.minSwipeDistance,
      edgeWidth = defaultProps.edgeWidth,
      drawerLockMode = defaultProps.drawerLockMode,
      overlayColor = defaultProps.overlayColor,
      enableTrackpadTwoFingerGesture = defaultProps.enableTrackpadTwoFingerGesture,
      activeCursor = defaultProps.activeCursor,
      mouseButton = defaultProps.mouseButton,
      statusBarAnimation = defaultProps.statusBarAnimation,
      hideStatusBar,
      keyboardDismissMode,
      userSelect,
      enableContextMenu,
      renderNavigationView,
      onDrawerSlide,
      onDrawerClose,
      onDrawerOpen,
      onDrawerStateChanged,
    } = props;

    const isFromLeft = drawerPosition === DrawerPosition.LEFT;

    const sideCorrection = isFromLeft ? 1 : -1;

    // While closing the drawer when user starts gesture in the greyed out part of the window,
    // we want the drawer to follow only once the finger reaches the edge of the drawer.
    // See the diagram for reference. * = starting finger position, < = current finger position
    // 1) +---------------+ 2) +---------------+ 3) +---------------+ 4) +---------------+
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    |XXXXXXXX|..<*..|    |XXXXXXXX|.<-*..|    |XXXXXXXX|<--*..|    |XXXXX|<-----*..|
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
    //    +---------------+    +---------------+    +---------------+    +---------------+

    const openValue = useSharedValue<number>(0);

    useDerivedValue(() => {
      onDrawerSlide && runOnJS(onDrawerSlide)(openValue.value);
    }, []);

    const isDrawerOpen = useSharedValue(false);

    const handleContainerLayout = ({ nativeEvent }: LayoutChangeEvent) => {
      setContainerWidth(nativeEvent.layout.width);
    };

    const emitStateChanged = useCallback(
      (newState: DrawerState, drawerWillShow: boolean) => {
        'worklet';
        onDrawerStateChanged &&
          runOnJS(onDrawerStateChanged)?.(newState, drawerWillShow);
      },
      [onDrawerStateChanged]
    );

    const drawerAnimatedProps = useAnimatedProps(() => ({
      accessibilityViewIsModal: isDrawerOpen.value,
    }));

    const overlayAnimatedProps = useAnimatedProps(() => ({
      pointerEvents: isDrawerOpen.value ? ('auto' as const) : ('none' as const),
    }));

    // While the drawer is hidden, it's hitSlop overflows onto the main view by edgeWidth
    // This way it can be swiped open even when it's hidden
    const [edgeHitSlop, setEdgeHitSlop] = useState<HitSlop>(
      isFromLeft
        ? { left: 0, width: edgeWidth }
        : { right: 0, width: edgeWidth }
    );

    // gestureOrientation is 1 if the gesture is expected to move from left to right and -1 otherwise
    const gestureOrientation = useMemo(
      () => sideCorrection * (drawerOpened ? -1 : 1),
      [sideCorrection, drawerOpened]
    );

    useEffect(() => {
      setEdgeHitSlop(
        isFromLeft
          ? { left: 0, width: edgeWidth }
          : { right: 0, width: edgeWidth }
      );
    }, [isFromLeft, edgeWidth]);

    const animateDrawer = useCallback(
      (toValue: number, initialVelocity: number, animationSpeed?: number) => {
        'worklet';
        const willShow = toValue !== 0;
        isDrawerOpen.value = willShow;

        emitStateChanged(DrawerState.SETTLING, willShow);
        runOnJS(setDrawerState)(DrawerState.SETTLING);

        if (hideStatusBar) {
          runOnJS(StatusBar.setHidden)(willShow, statusBarAnimation);
        }

        const normalizedToValue = interpolate(
          toValue,
          [0, drawerWidth],
          [0, 1],
          Extrapolation.CLAMP
        );

        const normalizedInitialVelocity = interpolate(
          initialVelocity,
          [0, drawerWidth],
          [0, 1],
          Extrapolation.CLAMP
        );

        openValue.value = withSpring(
          normalizedToValue,
          {
            overshootClamping: true,
            velocity: normalizedInitialVelocity,
            mass: animationSpeed ? 1 / animationSpeed : 1,
            damping: 40,
            stiffness: 500,
          },
          (finished) => {
            if (finished) {
              emitStateChanged(DrawerState.IDLE, willShow);
              runOnJS(setDrawerOpened)(willShow);
              runOnJS(setDrawerState)(DrawerState.IDLE);
              if (willShow) {
                onDrawerOpen && runOnJS(onDrawerOpen)?.();
              } else {
                onDrawerClose && runOnJS(onDrawerClose)?.();
              }
            }
          }
        );
      },
      [
        openValue,
        emitStateChanged,
        isDrawerOpen,
        hideStatusBar,
        onDrawerClose,
        onDrawerOpen,
        drawerWidth,
        statusBarAnimation,
      ]
    );

    const handleRelease = useCallback(
      (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        'worklet';
        let { translationX: dragX, velocityX, x: touchX } = event;

        if (drawerPosition !== DrawerPosition.LEFT) {
          // See description in _updateAnimatedEvent about why events are flipped
          // for right-side drawer
          dragX = -dragX;
          touchX = containerWidth - touchX;
          velocityX = -velocityX;
        }

        const gestureStartX = touchX - dragX;
        let dragOffsetBasedOnStart = 0;

        if (drawerType === DrawerType.FRONT) {
          dragOffsetBasedOnStart =
            gestureStartX > drawerWidth ? gestureStartX - drawerWidth : 0;
        }

        const startOffsetX =
          dragX +
          dragOffsetBasedOnStart +
          (isDrawerOpen.value ? drawerWidth : 0);

        const projOffsetX = startOffsetX + DRAG_TOSS * velocityX;

        const shouldOpen = projOffsetX > drawerWidth / 2;

        if (shouldOpen) {
          animateDrawer(drawerWidth, velocityX);
        } else {
          animateDrawer(0, velocityX);
        }
      },
      [
        animateDrawer,
        containerWidth,
        drawerPosition,
        drawerType,
        drawerWidth,
        isDrawerOpen,
      ]
    );

    const openDrawer = useCallback(
      (options: DrawerMovementOption = {}) => {
        'worklet';
        animateDrawer(
          drawerWidth,
          options.initialVelocity ?? 0,
          options.animationSpeed
        );
      },
      [animateDrawer, drawerWidth]
    );

    const closeDrawer = useCallback(
      (options: DrawerMovementOption = {}) => {
        'worklet';
        animateDrawer(0, options.initialVelocity ?? 0, options.animationSpeed);
      },
      [animateDrawer]
    );

    const overlayDismissGesture = useMemo(
      () =>
        Gesture.Tap()
          .maxDistance(25)
          .onEnd(() => {
            if (
              isDrawerOpen.value &&
              drawerLockMode !== DrawerLockMode.LOCKED_OPEN
            ) {
              closeDrawer();
            }
          }),
      [closeDrawer, isDrawerOpen, drawerLockMode]
    );

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
      opacity: openValue.value,
      backgroundColor: overlayColor,
    }));

    const fillHitSlop = useMemo(
      () => (isFromLeft ? { left: drawerWidth } : { right: drawerWidth }),
      [drawerWidth, isFromLeft]
    );

    const panGesture = useMemo(() => {
      return Gesture.Pan()
        .activeCursor(activeCursor)
        .mouseButton(mouseButton)
        .hitSlop(drawerOpened ? fillHitSlop : edgeHitSlop)
        .minDistance(drawerOpened ? 100 : 0)
        .activeOffsetX(gestureOrientation * minSwipeDistance)
        .failOffsetY([-15, 15])
        .simultaneousWithExternalGesture(overlayDismissGesture)
        .enableTrackpadTwoFingerGesture(enableTrackpadTwoFingerGesture)
        .enabled(
          drawerState !== DrawerState.SETTLING &&
            (drawerOpened
              ? drawerLockMode !== DrawerLockMode.LOCKED_OPEN
              : drawerLockMode !== DrawerLockMode.LOCKED_CLOSED)
        )
        .onStart(() => {
          emitStateChanged(DrawerState.DRAGGING, false);
          runOnJS(setDrawerState)(DrawerState.DRAGGING);
          if (keyboardDismissMode === DrawerKeyboardDismissMode.ON_DRAG) {
            runOnJS(Keyboard.dismiss)();
          }
          if (hideStatusBar) {
            runOnJS(StatusBar.setHidden)(true, statusBarAnimation);
          }
        })
        .onUpdate((event) => {
          const startedOutsideTranslation = isFromLeft
            ? interpolate(
                event.x,
                [0, drawerWidth, drawerWidth + 1],
                [0, drawerWidth, drawerWidth]
              )
            : interpolate(
                event.x - containerWidth,
                [-drawerWidth - 1, -drawerWidth, 0],
                [drawerWidth, drawerWidth, 0]
              );

          const startedInsideTranslation =
            sideCorrection *
            (event.translationX +
              (drawerOpened ? drawerWidth * -gestureOrientation : 0));

          const adjustedTranslation = Math.max(
            drawerOpened ? startedOutsideTranslation : 0,
            startedInsideTranslation
          );

          openValue.value = interpolate(
            adjustedTranslation,
            [-drawerWidth, 0, drawerWidth],
            [1, 0, 1],
            Extrapolation.CLAMP
          );
        })
        .onEnd(handleRelease);
    }, [
      drawerLockMode,
      openValue,
      drawerWidth,
      emitStateChanged,
      gestureOrientation,
      handleRelease,
      edgeHitSlop,
      fillHitSlop,
      minSwipeDistance,
      hideStatusBar,
      keyboardDismissMode,
      overlayDismissGesture,
      drawerOpened,
      isFromLeft,
      containerWidth,
      sideCorrection,
      drawerState,
      activeCursor,
      enableTrackpadTwoFingerGesture,
      mouseButton,
      statusBarAnimation,
    ]);

    // When using RTL, row and row-reverse flex directions are flipped.
    const reverseContentDirection = I18nManager.isRTL
      ? isFromLeft
      : !isFromLeft;

    const dynamicDrawerStyles = {
      backgroundColor: drawerBackgroundColor,
      width: drawerWidth,
    };

    const containerStyles = useAnimatedStyle(() => {
      if (drawerType === DrawerType.FRONT) {
        return {};
      }

      return {
        transform: [
          {
            translateX: interpolate(
              openValue.value,
              [0, 1],
              [0, drawerWidth * sideCorrection],
              Extrapolation.CLAMP
            ),
          },
        ],
      };
    });

    const drawerAnimatedStyle = useAnimatedStyle(() => {
      const closedDrawerOffset = drawerWidth * -sideCorrection;
      const isBack = drawerType === DrawerType.BACK;
      const isIdle = drawerState === DrawerState.IDLE;

      if (isBack) {
        return {
          transform: [{ translateX: 0 }],
          flexDirection: reverseContentDirection ? 'row-reverse' : 'row',
        };
      }

      let translateX = 0;

      if (isIdle) {
        translateX = drawerOpened ? 0 : closedDrawerOffset;
      } else {
        translateX = interpolate(
          openValue.value,
          [0, 1],
          [closedDrawerOffset, 0],
          Extrapolation.CLAMP
        );
      }

      return {
        transform: [{ translateX }],
        flexDirection: reverseContentDirection ? 'row-reverse' : 'row',
      };
    });

    const containerAnimatedProps = useAnimatedProps(() => ({
      importantForAccessibility:
        Platform.OS === 'android'
          ? isDrawerOpen.value
            ? ('no-hide-descendants' as const)
            : ('yes' as const)
          : undefined,
    }));

    const children =
      typeof props.children === 'function'
        ? props.children(openValue) // renderer function
        : props.children;

    useImperativeHandle(
      ref,
      () => ({
        openDrawer,
        closeDrawer,
      }),
      [openDrawer, closeDrawer]
    );

    return (
      <GestureDetector
        gesture={panGesture}
        userSelect={userSelect}
        enableContextMenu={enableContextMenu}>
        <Animated.View style={styles.main} onLayout={handleContainerLayout}>
          <GestureDetector gesture={overlayDismissGesture}>
            <Animated.View
              style={[
                drawerType === DrawerType.FRONT
                  ? styles.containerOnBack
                  : styles.containerInFront,
                containerStyles,
                contentContainerStyle,
              ]}
              animatedProps={containerAnimatedProps}>
              {children}
              <Animated.View
                animatedProps={overlayAnimatedProps}
                style={[styles.overlay, overlayAnimatedStyle]}
              />
            </Animated.View>
          </GestureDetector>
          <Animated.View
            pointerEvents="box-none"
            animatedProps={drawerAnimatedProps}
            style={[
              styles.drawerContainer,
              drawerAnimatedStyle,
              drawerContainerStyle,
            ]}>
            <Animated.View style={dynamicDrawerStyles}>
              {renderNavigationView(openValue)}
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    );
  }
);

export default DrawerLayout;

const styles = StyleSheet.create({
  drawerContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1001,
    flexDirection: 'row',
  },
  containerInFront: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1002,
  },
  containerOnBack: {
    ...StyleSheet.absoluteFillObject,
  },
  main: {
    flex: 1,
    zIndex: 0,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
