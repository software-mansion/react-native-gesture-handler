// This component is based on RN's DrawerLayoutAndroid API
// It's cross-compatible with all platforms despite
// `DrawerLayoutAndroid` only being available on android

import React, {
  ReactNode,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import {
  StyleSheet,
  StatusBarAnimation,
  StyleProp,
  ViewStyle,
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
    const dragX = useSharedValue<number>(0);
    const drawerTranslation = useSharedValue<number>(0);

    const {
      drawerPosition = defaultProps.drawerPosition,
      drawerWidth = defaultProps.drawerWidth,
      drawerType = defaultProps.drawerType,
      edgeWidth = defaultProps.edgeWidth,
      overlayColor = defaultProps.overlayColor,
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

    const openValue = useDerivedValue(() => {
      const newOpenValue = interpolate(
        drawerTranslation.value,
        [0, drawerWidth],
        [0, 1],
        Extrapolation.CLAMP
      );

      return newOpenValue;
    });

    const isDrawerOpen = useSharedValue(false);

    const overlayAnimatedProps = useAnimatedProps(() => ({
      pointerEvents: isDrawerOpen.value ? ('auto' as const) : ('none' as const),
    }));

    // While the drawer is hidden, it's hitSlop overflows onto the main view by edgeWidth
    // This way it can be swiped open even when it's hidden
    const [, setEdgeHitSlop] = useState<HitSlop>(
      isFromLeft
        ? { left: 0, width: edgeWidth }
        : { right: 0, width: edgeWidth }
    );

    // gestureOrientation is 1 if the gesture is expected to move from left to right and -1 otherwise

    const animateDrawer = useCallback(
      (toValue: number, initialVelocity: number, animationSpeed?: number) => {
        'worklet';
        const willShow = toValue !== 0;
        isDrawerOpen.value = willShow;
        runOnJS(setEdgeHitSlop)(
          isFromLeft
            ? { left: 0, width: willShow ? undefined : edgeWidth }
            : { right: 0, width: willShow ? undefined : edgeWidth }
        );

        drawerTranslation.value = withSpring(
          toValue,
          {
            // Velocity threshold does not matter as long as the destination is reached
            // This prevents rubberbanding
            restDisplacementThreshold: 1,
            restSpeedThreshold: 10000,
            overshootClamping: true,

            velocity: initialVelocity,
            mass: animationSpeed ? 1 / animationSpeed : 1,
            damping: 50,
            stiffness: 300,
          },
          (finished) => {
            if (finished) {
              if (willShow) {
                dragX.value = drawerWidth * sideCorrection;
              } else {
                dragX.value = 0;
              }
            }
          }
        );
      },
      [
        dragX,
        drawerTranslation,
        edgeWidth,
        isFromLeft,
        isDrawerOpen,
        drawerWidth,
        sideCorrection,
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

    const overlayDismissGesture = useMemo(
      () =>
        Gesture.Tap().onFinalize((_, success) =>
          console.log('drawer', success ? 'activated' : 'canceled')
        ),
      []
    );

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
      opacity: openValue.value,
      backgroundColor: overlayColor,
    }));

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

    const children =
      typeof props.children === 'function'
        ? props.children(openValue) // renderer function
        : props.children;

    const noop = () => null;
    useImperativeHandle(
      ref,
      () => ({
        openDrawer,
        closeDrawer: noop,
      }),
      [openDrawer]
    );

    return (
      <GestureDetector gesture={overlayDismissGesture}>
        <Animated.View style={[styles.containerOnBack, containerStyles]}>
          {children}
          <Animated.View
            animatedProps={overlayAnimatedProps}
            style={[styles.overlay, overlayAnimatedStyle]}
          />
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
