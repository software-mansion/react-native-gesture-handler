// This component is based on RN's DrawerLayoutAndroid API
//
// It perhaps deserves to be put in a separate repo, but since it relies on
// react-native-gesture-handler library which isn't very popular at the moment I
// decided to keep it here for the time being. It will allow us to move faster
// and fix issues that may arise in gesture handler library that could be found
// when using the drawer component

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
} from '../handlers/gestureHandlerCommon';

const DRAG_TOSS = 0.05;

const IDLE: DrawerState = 'Idle';
const DRAGGING: DrawerState = 'Dragging';
const SETTLING: DrawerState = 'Settling';

export type DrawerPosition = 'left' | 'right';

export type DrawerState = 'Idle' | 'Dragging' | 'Settling';

export type DrawerType = 'front' | 'back' | 'slide';

export type DrawerLockMode = 'unlocked' | 'locked-closed' | 'locked-open';

export type DrawerKeyboardDismissMode = 'none' | 'on-drag';

export interface DrawerLayoutProps {
  /**
   * This attribute is present in the standard implementation already and is one
   * of the required params. Gesture handler version of DrawerLayout make it
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
  useNativeAnimations?: boolean;

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
   * @default black
   *
   * Color of a semi-transparent overlay to be displayed on top of the content
   * view when drawer gets open. A solid color should be used as the opacity is
   * added by the Drawer itself and the opacity of the overlay is animated (from
   * 0% to 70%).
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

  // %% we don't support this ref anymore, see if we can replace it
  // onGestureRef?: (ref: PanGestureHandler) => void;

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

const positions = {
  Left: 'left',
  Right: 'right',
};

const defaultProps = {
  drawerWidth: 200,
  drawerPosition: positions.Left,
  useNativeAnimations: true,
  drawerType: 'front',
  edgeWidth: 20,
  minSwipeDistance: 3,
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  drawerLockMode: 'unlocked',
  enableTrackpadTwoFingerGesture: false,
};

const DrawerLayout = React.forwardRef<DrawerLayoutMethods, DrawerLayoutProps>(
  function DrawerLayout(props: DrawerLayoutProps, ref) {
    const dragX = useSharedValue<number>(0);
    const touchX = useSharedValue<number>(0);
    const drawerTranslation = useSharedValue<number>(0);

    const [containerWidth, setContainerWidth] = React.useState(0);
    const [drawerState, setDrawerState] = React.useState<DrawerState>(IDLE);
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
      useNativeAnimations = defaultProps.useNativeAnimations,
    } = props;

    const fromLeft = drawerPosition === positions.Left;

    // %% this likely shouldn't be reset every render
    if (drawerPosition !== positions.Left) {
      // To handle right-side drawers, reverse events coming from gesture handler
      // in a way they emulate left-side drawer gestures
      touchX.value = containerWidth;
    } else {
      touchX.value = 0;
    }

    const sideCorrectedDragX = useDerivedValue(() =>
      drawerPosition !== positions.Left ? -1 * dragX.value : dragX.value
    );

    // %% determine if we need such comments in the code, keep at least until properly tested
    // While closing the drawer when user starts gesture outside of its area (in greyed
    // out part of the window), we want the drawer to follow only once finger reaches the
    // edge of the drawer.
    // E.g. on the diagram below drawer is illustrate by X signs and the greyed out area by
    // dots. The touch gesture starts at '*' and moves left, touch path is indicated by
    // an arrow pointing left
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
      useNativeDriver: boolean;
      listener?: (event: { nativeEvent: { translationX: number } }) => void;
    } = React.useMemo(
      () => ({
        useNativeDriver: useNativeAnimations,
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
      [containerWidth, props, useNativeAnimations]
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

    // When drawer is closed we want the hitSlop to be horizontally shorter than
    // the container size by the value of SLOP. This will make it only activate
    // when gesture happens not further than SLOP away from the edge.
    const [hitSlop, setHitSlop] = React.useState<HitSlop>(
      fromLeft ? { left: 0, width: edgeWidth } : { right: 0, width: edgeWidth }
    );

    const updateShowing = React.useCallback(
      (showing: boolean) => {
        'worklet';
        isDrawerShowing.value = showing;
      },
      [isDrawerShowing]
    );

    const animateDrawer = React.useCallback(
      (toValue: number, velocity: number, speed?: number) => {
        'worklet';
        dragX.value = 0;
        touchX.value =
          props.drawerPosition === positions.Left ? 0 : containerWidth;

        // %% removed frame prediction as it was causing problems
        // ^^ make sure frame jumpiness is not a problem with Reanimated

        const willShow = toValue !== 0;
        isDrawerOpen.value = willShow;
        runOnJS(setHitSlop)(
          fromLeft
            ? { left: 0, width: isDrawerOpen.value ? undefined : edgeWidth }
            : { right: 0, width: isDrawerOpen.value ? undefined : edgeWidth }
        );

        updateShowing(willShow);
        emitStateChanged(SETTLING, willShow);
        runOnJS(setDrawerState)(SETTLING);

        if (props.hideStatusBar) {
          StatusBar.setHidden(willShow, props.statusBarAnimation || 'slide');
        }

        drawerTranslation.value = withSpring(
          toValue,
          {
            // velocity does not matter as long as the destination is reached
            // this prevents rubberbanding
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
              emitStateChanged(IDLE, willShow);
              runOnJS(setDrawerOpened)(willShow);
              if (drawerState !== DRAGGING) {
                // It's possilbe that user started drag while the drawer
                // was settling, don't override state in this case
                runOnJS(setDrawerState)(IDLE);
              }
              if (willShow) {
                props.onDrawerOpen && runOnJS(props.onDrawerOpen)?.();
              } else {
                props.onDrawerClose && runOnJS(props.onDrawerClose)?.();
              }
            }
          }
        );
      },
      [
        containerWidth,
        dragX,
        drawerState,
        drawerTranslation,
        edgeWidth,
        emitStateChanged,
        fromLeft,
        isDrawerOpen,
        props.drawerPosition,
        props.hideStatusBar,
        props.onDrawerClose,
        props.onDrawerOpen,
        props.statusBarAnimation,
        touchX,
        updateShowing,
      ]
    );

    const handleRelease = React.useCallback(
      ({
        nativeEvent,
      }: {
        nativeEvent: {
          translationX: number;
          velocityX: number;
          x: number;
        };
      }) => {
        let { translationX: dragX, velocityX, x: touchX } = nativeEvent;

        if (drawerPosition !== positions.Left) {
          // See description in _updateAnimatedEvent about why events are flipped
          // for right-side drawer
          dragX = -dragX;
          touchX = containerWidth - touchX;
          velocityX = -velocityX;
        }

        const gestureStartX = touchX - dragX;
        let dragOffsetBasedOnStart = 0;

        if (drawerType === 'front') {
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
        Gesture.Tap().onEnd(() => {
          if (isDrawerOpen.value && props.drawerLockMode !== 'locked-open') {
            closeDrawer();
          }
        }),
      [closeDrawer, isDrawerOpen.value, props.drawerLockMode]
    );

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
      opacity: openValue.value,
      backgroundColor: props.overlayColor ?? defaultProps.overlayColor,
    }));

    const renderOverlay = React.useCallback(() => {
      return (
        <GestureDetector gesture={overlayDismissGesture}>
          <Animated.View
            pointerEvents={isDrawerOpen.value ? 'auto' : 'none'}
            animatedProps={overlayAnimatedProps}
            style={[styles.overlay, overlayAnimatedStyle]}
          />
        </GestureDetector>
      );
    }, [
      isDrawerOpen.value,
      overlayAnimatedProps,
      overlayAnimatedStyle,
      overlayDismissGesture,
    ]);

    // %% this should be dynamic, it uses SV in the render body
    // gestureOrientation is 1 if the expected gesture is from left to right and
    // -1 otherwise e.g. when drawer is on the left and is closed we expect left
    // to right gesture, thus orientation will be 1.
    const gestureOrientation =
      (fromLeft ? 1 : -1) * (isDrawerOpen.value ? -1 : 1);

    const panGesture = React.useMemo(() => {
      return Gesture.Pan()
        .activeCursor(props.activeCursor ?? 'auto')
        .mouseButton(props.mouseButton ?? MouseButton.LEFT)
        .hitSlop(hitSlop)
        .activeOffsetX(gestureOrientation * minSwipeDistance)
        .failOffsetY([-15, 15])
        .enableTrackpadTwoFingerGesture(
          props.enableTrackpadTwoFingerGesture ?? false
        )
        .enabled(
          drawerLockMode !== 'locked-closed' && drawerLockMode !== 'locked-open'
        )
        .onStart(() => {
          emitStateChanged(DRAGGING, false);
          runOnJS(setDrawerState)(DRAGGING);
          if (props.keyboardDismissMode === 'on-drag') {
            runOnJS(Keyboard.dismiss)();
          }
          if (props.hideStatusBar) {
            runOnJS(StatusBar.setHidden)(
              true,
              props.statusBarAnimation ?? 'slide'
            );
          }
        })
        .onEnd((event) => {
          runOnJS(handleRelease)({ nativeEvent: event });
        })
        .onUpdate((event) => {
          // %% removed touchX from the equation, add it back if we want no panning to occur until the finger touches the drawer edge
          dragX.value = event.translationX;
          touchX.value = event.x;
          drawerTranslation.value =
            drawerType === 'front'
              ? sideCorrectedDragX.value +
                interpolate(
                  -1 * sideCorrectedDragX.value,
                  [drawerWidth - 1, drawerWidth, drawerWidth + 1],
                  [0, 0, 1]
                )
              : sideCorrectedDragX.value;
        });
    }, [
      dragX,
      drawerLockMode,
      drawerTranslation,
      drawerType,
      drawerWidth,
      emitStateChanged,
      gestureOrientation,
      handleRelease,
      hitSlop,
      minSwipeDistance,
      props.activeCursor,
      props.enableTrackpadTwoFingerGesture,
      props.hideStatusBar,
      props.keyboardDismissMode,
      props.mouseButton,
      props.statusBarAnimation,
      sideCorrectedDragX.value,
      touchX,
    ]);

    // When using RTL, row and row-reverse flex directions are flipped.
    const reverseContentDirection = I18nManager.isRTL ? fromLeft : !fromLeft;

    const dynamicDrawerStyles = {
      backgroundColor: drawerBackgroundColor,
      width: drawerWidth,
    };

    const containerStyles = useAnimatedStyle(() => {
      if (drawerType === 'front') {
        return {};
      }

      return {
        transform: [
          {
            translateX: interpolate(
              openValue.value,
              [0, 1],
              fromLeft ? [0, drawerWidth] : [0, -drawerWidth],
              Extrapolation.CLAMP
            ),
          },
        ],
      };
    });

    const drawerAnimatedStyle = useAnimatedStyle(() => {
      const closedDrawerOffset = fromLeft ? -drawerWidth : drawerWidth;

      return {
        transform: [
          {
            translateX:
              drawerType === 'back'
                ? 0
                : drawerState === IDLE
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
        <Animated.View
          ref={componentRef}
          style={styles.main}
          onLayout={handleContainerLayout}>
          <Animated.View
            style={[
              drawerType === 'front'
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
