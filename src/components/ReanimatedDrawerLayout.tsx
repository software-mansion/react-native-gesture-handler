// This component is based on RN's DrawerLayoutAndroid API
// It's cross-compatible with all platforms despite
// `DrawerLayoutAndroid` only being available on android

import * as React from 'react';
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
  LEFT = 'left',
  RIGHT = 'right',
}

export enum DrawerState {
  IDLE = 'Idle',
  DRAGGING = 'Dragging',
  SETTLING = 'Settling',
}

export enum DrawerType {
  FRONT = 'front',
  BACK = 'back',
  SLIDE = 'slide',
}

export enum DrawerLockMode {
  UNLOCKED = 'unlocked',
  LOCKED_CLOSED = 'locked-closed',
  LOCKED_OPEN = 'locked-open',
}

export enum DrawerKeyboardDismissMode {
  NONE = 'none',
  ON_DRAG = 'on-drag',
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
  ) => React.ReactNode;

  drawerPosition?: DrawerPosition;

  drawerWidth?: number;

  drawerBackgroundColor?: string;

  drawerLockMode?: DrawerLockMode;

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

  drawerType?: DrawerType;

  /**
   * Defines how far from the edge of the content view the gesture should
   * activate.
   */
  edgeWidth?: number;

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

  contentContainerStyle?: StyleProp<ViewStyle>;

  drawerContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Enables two-finger gestures on supported devices, for example iPads with
   * trackpads. If not enabled the gesture will require click + drag, with
   * `enableTrackpadTwoFingerGesture` swiping with two fingers will also trigger
   * the gesture.
   */
  enableTrackpadTwoFingerGesture?: boolean;

  onDrawerSlide?: (position: number) => void;

  // Implicit `children` prop has been removed in @types/react^18.0.0
  children?:
    | React.ReactNode
    | ((openValue?: SharedValue<number>) => React.ReactNode);

  /**
   * @default 'none'
   * Defines which userSelect property should be used.
   * Values: 'none'|'text'|'auto'
   */
  userSelect?: UserSelect;

  /**
   * @default 'auto'
   * Defines which cursor property should be used when gesture activates.
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
  velocity?: number;
  speed?: number;
};

interface DrawerLayoutMethods {
  openDrawer: (options: DrawerMovementOption) => void;
  closeDrawer: (options: DrawerMovementOption) => void;
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

const DrawerLayout = React.forwardRef<DrawerLayoutMethods, DrawerLayoutProps>(
  function DrawerLayout(props: DrawerLayoutProps, ref) {
    const dragX = useSharedValue<number>(0);
    const drawerTranslation = useSharedValue<number>(0);

    const [containerWidth, setContainerWidth] = React.useState(0);
    const [drawerState, setDrawerState] = React.useState<DrawerState>(
      DrawerState.IDLE
    );
    const [drawerOpened, setDrawerOpened] = React.useState(false);

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
    } = props;

    const isFromLeft = drawerPosition === DrawerPosition.LEFT;

    const sideCorrection = isFromLeft ? 1 : -1;

    const sideCorrectedDragX = useDerivedValue(
      () => sideCorrection * dragX.value
    );

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

    const openValue = useDerivedValue(() => {
      return interpolate(
        drawerTranslation.value,
        [0, drawerWidth],
        [0, 1],
        Extrapolation.CLAMP
      );
    });

    const gestureOptions: {
      listener?: (event: { nativeEvent: { translationX: number } }) => void;
    } = React.useMemo(
      () => ({
        listener: props.onDrawerSlide
          ? (ev) => {
              const translationX = Math.floor(
                Math.abs(ev.nativeEvent.translationX)
              );
              const position = translationX / containerWidth;

              props.onDrawerSlide?.(position);
            }
          : undefined,
      }),
      [containerWidth, props]
    );

    if (props.onDrawerSlide) {
      gestureOptions.listener = (ev) => {
        const translationX = Math.floor(Math.abs(ev.nativeEvent.translationX));
        const position = translationX / containerWidth;

        props.onDrawerSlide?.(position);
      };
    }

    const isDrawerOpen = useSharedValue(false);

    const handleContainerLayout = ({ nativeEvent }: LayoutChangeEvent) => {
      setContainerWidth(nativeEvent.layout.width);
    };

    const emitStateChanged = React.useCallback(
      (newState: DrawerState, drawerWillShow: boolean) => {
        'worklet';
        props.onDrawerStateChanged &&
          runOnJS(props.onDrawerStateChanged)?.(newState, drawerWillShow);
      },
      [props.onDrawerStateChanged]
    );

    const isDrawerShowing = useSharedValue(false);

    const drawerAnimatedProps = useAnimatedProps(() => ({
      accessibilityViewIsModal: isDrawerShowing.value,
    }));

    const overlayAnimatedProps = useAnimatedProps(() => ({
      pointerEvents: isDrawerShowing.value
        ? ('auto' as const)
        : ('none' as const),
    }));

    // While the drawer is hidden, it's hitSlop overflows onto the main view by edgeWidth
    // This way it can be swiped open even when it's hidden
    const [edgeHitSlop, setEdgeHitSlop] = React.useState<HitSlop>(
      isFromLeft ? { right: edgeWidth } : { left: edgeWidth }
    );

    // gestureOrientation is 1 if the gesture is expected to move from left to right and -1 otherwise
    const gestureOrientation = React.useMemo(
      () => (isFromLeft ? 1 : -1) * (drawerOpened ? -1 : 1),
      [isFromLeft, drawerOpened]
    );

    const animateDrawer = React.useCallback(
      (toValue: number, velocity: number, speed?: number) => {
        'worklet';
        const willShow = toValue !== 0;
        isDrawerOpen.value = willShow;
        runOnJS(setEdgeHitSlop)(
          isFromLeft
            ? { left: 0, width: isDrawerOpen.value ? undefined : edgeWidth }
            : { right: 0, width: isDrawerOpen.value ? undefined : edgeWidth }
        );

        isDrawerShowing.value = willShow;

        emitStateChanged(DrawerState.SETTLING, willShow);
        runOnJS(setDrawerState)(DrawerState.SETTLING);

        if (props.hideStatusBar) {
          StatusBar.setHidden(willShow, statusBarAnimation);
        }

        drawerTranslation.value = withSpring(
          toValue,
          {
            // Velocity threshold does not matter as long as the destination is reached
            // This prevents rubberbanding
            restDisplacementThreshold: 1,
            restSpeedThreshold: 10000,
            overshootClamping: true,

            velocity,
            mass: speed ? 1 / speed : 2,
            damping: 80,
            stiffness: 500,
          },
          (finished) => {
            if (finished) {
              emitStateChanged(DrawerState.IDLE, willShow);
              runOnJS(setDrawerOpened)(willShow);
              runOnJS(setDrawerState)(DrawerState.IDLE);
              if (willShow) {
                dragX.value = drawerWidth * sideCorrection;
                props.onDrawerOpen && runOnJS(props.onDrawerOpen)?.();
              } else {
                dragX.value = 0;
                props.onDrawerClose && runOnJS(props.onDrawerClose)?.();
              }
            }
          }
        );
      },
      [
        dragX,
        drawerTranslation,
        edgeWidth,
        emitStateChanged,
        isFromLeft,
        isDrawerOpen,
        props.hideStatusBar,
        props.onDrawerClose,
        props.onDrawerOpen,
        drawerWidth,
        sideCorrection,
        isDrawerShowing,
        statusBarAnimation,
      ]
    );

    const handleRelease = React.useCallback(
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
        isDrawerOpen.value,
      ]
    );

    const openDrawer = (options: DrawerMovementOption = {}) => {
      'worklet';
      animateDrawer(
        drawerWidth,
        options.velocity ? options.velocity : 0,
        options.speed
      );
    };

    const closeDrawer = React.useCallback(
      (options: DrawerMovementOption = {}) => {
        'worklet';
        animateDrawer(
          0,
          options.velocity ? options.velocity : 0,
          options.speed
        );
      },
      [animateDrawer]
    );

    const overlayDismissGesture = React.useMemo(
      () =>
        Gesture.Tap()
          .maxDistance(25)
          .onEnd(() => {
            if (
              isDrawerOpen.value &&
              props.drawerLockMode !== DrawerLockMode.LOCKED_OPEN
            ) {
              closeDrawer();
            }
          }),
      [closeDrawer, isDrawerOpen.value, props.drawerLockMode]
    );

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
      opacity: openValue.value,
      backgroundColor: overlayColor,
    }));

    const renderOverlay = React.useCallback(() => {
      return (
        <GestureDetector gesture={overlayDismissGesture}>
          <Animated.View
            animatedProps={overlayAnimatedProps}
            style={[styles.overlay, overlayAnimatedStyle]}
          />
        </GestureDetector>
      );
    }, [overlayAnimatedProps, overlayAnimatedStyle, overlayDismissGesture]);

    const fillHitSlop = React.useMemo(
      () => (isFromLeft ? { left: drawerWidth } : { right: drawerWidth }),
      [drawerWidth, isFromLeft]
    );

    const panGesture = React.useMemo(() => {
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
          drawerLockMode !== DrawerLockMode.LOCKED_CLOSED &&
            drawerLockMode !== DrawerLockMode.LOCKED_OPEN &&
            drawerState !== DrawerState.SETTLING
        )
        .onStart(() => {
          emitStateChanged(DrawerState.DRAGGING, false);
          runOnJS(setDrawerState)(DrawerState.DRAGGING);
          if (props.keyboardDismissMode === 'on-drag') {
            runOnJS(Keyboard.dismiss)();
          }
          if (props.hideStatusBar) {
            runOnJS(StatusBar.setHidden)(true, statusBarAnimation);
          }
        })
        .onUpdate((event) => {
          dragX.value =
            sideCorrection *
            Math.max(
              drawerOpened
                ? isFromLeft
                  ? interpolate(
                      event.x,
                      [0, drawerWidth, drawerWidth + 1],
                      [0, drawerWidth, drawerWidth]
                    )
                  : interpolate(
                      event.x - containerWidth,
                      [-drawerWidth - 1, -drawerWidth, 0],
                      [drawerWidth, drawerWidth, 0]
                    )
                : 0,
              sideCorrection *
                (event.translationX +
                  (drawerOpened ? drawerWidth * -gestureOrientation : 0))
            );

          drawerTranslation.value =
            drawerType === DrawerType.FRONT
              ? sideCorrectedDragX.value +
                interpolate(
                  -1 * sideCorrectedDragX.value,
                  [drawerWidth - 1, drawerWidth, drawerWidth + 1],
                  [0, 0, 1]
                )
              : sideCorrectedDragX.value;
        })
        .onEnd(handleRelease);
    }, [
      dragX,
      drawerLockMode,
      drawerTranslation,
      drawerType,
      drawerWidth,
      emitStateChanged,
      gestureOrientation,
      handleRelease,
      edgeHitSlop,
      fillHitSlop,
      minSwipeDistance,
      props.hideStatusBar,
      props.keyboardDismissMode,
      sideCorrectedDragX.value,
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

      return {
        transform: [
          {
            translateX:
              drawerType === DrawerType.BACK
                ? 0
                : drawerState === DrawerState.IDLE
                ? drawerOpened
                  ? 0
                  : closedDrawerOffset
                : interpolate(
                    openValue.value,
                    [0, 1],
                    [closedDrawerOffset, 0],
                    Extrapolation.CLAMP
                  ),
          },
        ],
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

    const componentRef = React.useRef(null);

    React.useImperativeHandle(
      ref,
      () => ({
        ...componentRef,
        openDrawer,
        closeDrawer,
      }),
      // componentRef.current is neccessary, eslint thinks it will be reloaded each render
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [componentRef.current, openDrawer, closeDrawer]
    );

    return (
      <GestureDetector
        gesture={panGesture}
        userSelect={props.userSelect}
        enableContextMenu={props.enableContextMenu}>
        {/* ^^^ "false if MouseButton.RIGHT is specified" either remove that description or add that logic */}
        <Animated.View
          ref={componentRef}
          style={styles.main}
          onLayout={handleContainerLayout}>
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
            {renderOverlay()}
          </Animated.View>
          <Animated.View
            pointerEvents="box-none"
            animatedProps={drawerAnimatedProps}
            accessibilityViewIsModal={isDrawerOpen.value}
            style={[
              styles.drawerContainer,
              drawerAnimatedStyle,
              drawerContainerStyle,
            ]}>
            <Animated.View style={dynamicDrawerStyles}>
              {props.renderNavigationView(openValue)}
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