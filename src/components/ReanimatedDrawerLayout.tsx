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
  View,
  Keyboard,
  StatusBar,
  I18nManager,
  StatusBarAnimation,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';

import {
  HandlerStateChangeEvent,
  UserSelect,
  ActiveCursor,
  MouseButton,
} from '../handlers/gestureHandlerCommon';
import { PanGestureHandler } from '../handlers/PanGestureHandler';
import type { PanGestureHandlerEventPayload } from '../handlers/GestureHandlerEventPayload';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';

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

  onGestureRef?: (ref: PanGestureHandler) => void;

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

const DrawerLayout = React.forwardRef(function DrawerLayout(
  props: DrawerLayoutProps,
  ref
) {
  const dragX = useSharedValue<number>(0);
  const touchX = useSharedValue<number>(0);
  const drawerTranslation = useSharedValue<number>(0);

  const [containerWidth, setContainerWidth] = React.useState(0);
  const [drawerState, setDrawerState] = React.useState<DrawerState>(IDLE);
  const [drawerOpened, setDrawerOpened] = React.useState(false);

  // %% see if neccessary after moving to FC
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

  const nestedDragX = useSharedValue<number>(0);
  const nestedTouchX = useSharedValue<number>(0);

  const openValue = useSharedValue<number>(0);

  // %% START | this was in constructor
  // Event definition is based on
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

  nestedDragX.value = dragX.value;
  nestedTouchX.value = touchX.value;

  const local_dragX = useDerivedValue(() =>
    drawerPosition !== positions.Left
      ? -1 * nestedDragX.value
      : nestedDragX.value
  );

  const local_touchX = useDerivedValue(() =>
    drawerPosition !== positions.Left
      ? containerWidth + -1 * nestedTouchX.value
      : nestedTouchX.value
  );

  if (drawerPosition !== positions.Left) {
    // Most of the code is written in a way to handle left-side drawer. In
    // order to handle right-side drawer the only thing we need to do is to
    // reverse events coming from gesture handler in a way they emulate
    // left-side drawer gestures. E.g. dragX is simply -dragX, and touchX is
    // calulcated by subtracing real touchX from the width of the container
    // (such that when touch happens at the right edge the value is simply 0)
    nestedTouchX.value = containerWidth;
  } else {
    nestedTouchX.value = 0;
  }

  // While closing the drawer when user starts gesture outside of its area (in greyed
  // out part of the window), we want the drawer to follow only once finger reaches the
  // edge of the drawer.
  // E.g. on the diagram below drawer is illustrate by X signs and the greyed out area by
  // dots. The touch gesture starts at '*' and moves left, touch path is indicated by
  // an arrow pointing left
  // 1) +---------------+ 2) +---------------+ 3) +---------------+ 4) +---------------+
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    |XXXXXXXX|......|    |XXXXXXXX|.<-*..|    |XXXXXXXX|<--*..|    |XXXXX|<-----*..|
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXXXXX|......|    |XXXXX|.........|
  //    +---------------+    +---------------+    +---------------+    +---------------+
  //
  // For the above to work properly we define animated value that will keep
  // start position of the gesture. Then we use that value to calculate how
  // much we need to subtract from the dragX. If the gesture started on the
  // greyed out area we take the distance from the edge of the drawer to the
  // start position. Otherwise we don't subtract at all and the drawer be
  // pulled back as soon as you start the pan.
  //
  // This is used only when drawerType is "front"
  //
  const drawerType_eq_front_startPositionX = useDerivedValue(
    () => local_touchX.value + -1 * local_dragX.value
  );

  const drawerType_eq_front_dragOffsetFromOnStartPosition = interpolate(
    drawerType_eq_front_startPositionX.value,
    [drawerWidth - 1, drawerWidth, drawerWidth + 1],
    [0, 0, 1]
  );

  const translationX = useDerivedValue(() =>
    drawerType === 'front'
      ? local_dragX.value + drawerType_eq_front_dragOffsetFromOnStartPosition
      : local_dragX.value
  );

  if (openValue) {
    openValue.value = interpolate(
      translationX.value + drawerTranslation.value,
      [0, drawerWidth],
      [0, 1],
      Extrapolation.CLAMP
    );
  }

  const gestureOptions: {
    useNativeDriver: boolean;
    // TODO: make sure it is correct
    listener?: (
      ev: NativeSyntheticEvent<PanGestureHandlerEventPayload>
    ) => void;
  } = {
    useNativeDriver: useNativeAnimations,
  };

  if (props.onDrawerSlide) {
    gestureOptions.listener = (ev) => {
      const translationX = Math.floor(Math.abs(ev.nativeEvent.translationX));
      const position = translationX / containerWidth;

      props.onDrawerSlide?.(position);
    };
  }

  // %% END | this was in constructor

  const accessibilityIsModalView = React.createRef<View>();
  const pointerEventsView = React.createRef<View>();
  const panGestureHandler = React.createRef<PanGestureHandler | null>();

  // %% START | not sure if ref or state
  const drawerShown = React.useRef(false);
  // %% END | not sure if ref or state

  const handleContainerLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    setContainerWidth(nativeEvent.layout.width);
  };

  const emitStateChanged = (newState: DrawerState, drawerWillShow: boolean) => {
    props.onDrawerStateChanged?.(newState, drawerWillShow);
  };

  const handleRelease = ({
    nativeEvent,
  }: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
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
      dragX + dragOffsetBasedOnStart + (drawerShown.current ? drawerWidth : 0);
    const projOffsetX = startOffsetX + DRAG_TOSS * velocityX;

    const shouldOpen = projOffsetX > drawerWidth / 2;

    if (shouldOpen) {
      animateDrawer(startOffsetX, drawerWidth, velocityX);
    } else {
      animateDrawer(startOffsetX, 0, velocityX);
    }
  };

  const updateShowing = (showing: boolean) => {
    drawerShown.current = showing;
    accessibilityIsModalView.current?.setNativeProps({
      accessibilityViewIsModal: showing,
    });
    pointerEventsView.current?.setNativeProps({
      pointerEvents: showing ? 'auto' : 'none',
    });
    // gestureOrientation is 1 if the expected gesture is from left to right and
    // -1 otherwise e.g. when drawer is on the left and is closed we expect left
    // to right gesture, thus orientation will be 1.
    const gestureOrientation = (fromLeft ? 1 : -1) * (showing ? -1 : 1);
    // When drawer is closed we want the hitSlop to be horizontally shorter than
    // the container size by the value of SLOP. This will make it only activate
    // when gesture happens not further than SLOP away from the edge
    const hitSlop = fromLeft
      ? { left: 0, width: showing ? undefined : edgeWidth }
      : { right: 0, width: showing ? undefined : edgeWidth };

    // %% FIXME setNativeProps has issues iirc, may not work on web
    // @ts-ignore internal API, maybe could be fixed in handler types
    panGestureHandler.current?.setNativeProps({
      hitSlop,
      activeOffsetX: gestureOrientation * minSwipeDistance,
    });
  };

  const animateDrawer = (
    fromValue: number | null | undefined,
    toValue: number,
    velocity: number,
    _speed?: number // %% do not remove
  ) => {
    dragX.value = 0;
    touchX.value = props.drawerPosition === positions.Left ? 0 : containerWidth;

    if (fromValue != null) {
      let nextFramePosition = fromValue;
      if (props.useNativeAnimations) {
        // When using native driver, we predict the next position of the
        // animation because it takes one frame of a roundtrip to pass RELEASE
        // event from native driver to JS before we can start animating. Without
        // it, it is more noticable that the frame is dropped.
        if (fromValue < toValue && velocity > 0) {
          nextFramePosition = Math.min(fromValue + velocity / 60.0, toValue);
        } else if (fromValue > toValue && velocity < 0) {
          nextFramePosition = Math.max(fromValue + velocity / 60.0, toValue);
        }
      }
      drawerTranslation.value = nextFramePosition;
    }

    const willShow = toValue !== 0;
    updateShowing(willShow);
    emitStateChanged(SETTLING, willShow);
    setDrawerState(SETTLING);
    if (props.hideStatusBar) {
      StatusBar.setHidden(willShow, props.statusBarAnimation || 'slide');
    }
    drawerTranslation.value = withSpring(
      toValue,
      {
        velocity,
      },
      (finished) => {
        if (finished) {
          emitStateChanged(IDLE, willShow);
          setDrawerOpened(willShow);
          if (drawerState !== DRAGGING) {
            // It's possilbe that user started drag while the drawer
            // was settling, don't override state in this case
            setDrawerState(IDLE);
          }
          if (willShow) {
            props.onDrawerOpen?.();
          } else {
            props.onDrawerClose?.();
          }
        }
      }
    );
  };

  const openDrawer = (options: DrawerMovementOption = {}) => {
    animateDrawer(
      // TODO: decide if it should be null or undefined is the proper value
      undefined,
      drawerWidth,
      options.velocity ? options.velocity : 0,
      options.speed
    );

    // We need to force the update, otherwise the overlay is not rerendered and
    // it would not be clickable
    forceUpdate();
  };

  const closeDrawer = (options: DrawerMovementOption = {}) => {
    // TODO: decide if it should be null or undefined is the proper value
    animateDrawer(
      undefined,
      0,
      options.velocity ? options.velocity : 0,
      options.speed
    );

    // We need to force the update, otherwise the overlay is not rerendered and
    // it would be still clickable
    forceUpdate();
  };

  const renderOverlay = () => {
    /* Overlay styles */
    const overlayOpacity =
      drawerState !== IDLE ? openValue : drawerOpened ? 1 : 0;

    const dynamicOverlayStyles = {
      opacity: overlayOpacity,
      backgroundColor: props.overlayColor ?? defaultProps.overlayColor,
    };

    const tapGesture = Gesture.Tap().onEnd(() => {
      if (drawerShown.current && props.drawerLockMode !== 'locked-open') {
        closeDrawer();
      }
    });

    return (
      <GestureDetector gesture={tapGesture}>
        <Animated.View
          pointerEvents={drawerShown.current ? 'auto' : 'none'}
          ref={pointerEventsView}
          style={[styles.overlay, dynamicOverlayStyles]}
        />
      </GestureDetector>
    );
  };

  // %% START | reimplement for new api or remove
  // const setPanGestureRef = (ref: PanGestureHandler) => {
  //   // TODO(TS): make sure it is OK taken from
  //   // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31065#issuecomment-596081842
  //   (panGestureHandler as React.MutableRefObject<PanGestureHandler>).current =
  //     ref;
  //   props.onGestureRef?.(ref);
  // };
  // %% END | reimplement for new api or remove

  const fromLeft = drawerPosition === positions.Left;

  // gestureOrientation is 1 if the expected gesture is from left to right and
  // -1 otherwise e.g. when drawer is on the left and is closed we expect left
  // to right gesture, thus orientation will be 1.
  const gestureOrientation =
    (fromLeft ? 1 : -1) * (drawerShown.current ? -1 : 1);

  // When drawer is closed we want the hitSlop to be horizontally shorter than
  // the container size by the value of SLOP. This will make it only activate
  // when gesture happens not further than SLOP away from the edge
  const hitSlop = fromLeft
    ? { left: 0, width: drawerShown.current ? undefined : edgeWidth }
    : { right: 0, width: drawerShown.current ? undefined : edgeWidth };

  const panGesture = Gesture.Pan()
    .activeCursor(props.activeCursor ?? 'auto')
    .mouseButton(props.mouseButton ?? MouseButton.LEFT)
    .hitSlop(hitSlop)
    .activeOffsetX(gestureOrientation * minSwipeDistance)
    .failOffsetY([-15, 15])
    .enableTrackpadTwoFingerGesture(
      props.enableTrackpadTwoFingerGesture ?? false
    ) // %% verify if should be `false`
    .enabled(
      drawerLockMode !== 'locked-closed' && drawerLockMode !== 'locked-open'
    )
    .onStart(() => {
      emitStateChanged(DRAGGING, false);
      setDrawerState(DRAGGING);
      if (props.keyboardDismissMode === 'on-drag') {
        Keyboard.dismiss();
      }
      if (props.hideStatusBar) {
        StatusBar.setHidden(true, props.statusBarAnimation || 'slide');
      }
    })
    .onEnd((event) => handleRelease({ nativeEvent: event }))
    .onUpdate((event) => {
      nestedDragX.value = event.translationX;
      nestedTouchX.value = event.x;
    });

  const drawerSlide = drawerType !== 'back';
  const containerSlide = drawerType !== 'front';

  // We rely on row and row-reverse flex directions to position the drawer
  // properly. Apparently for RTL these are flipped which requires us to use
  // the opposite setting for the drawer to appear from left or right
  // according to the drawerPosition prop
  const reverseContentDirection = I18nManager.isRTL ? fromLeft : !fromLeft;

  const dynamicDrawerStyles = {
    backgroundColor: drawerBackgroundColor,
    width: drawerWidth,
  };

  // %% change into an animated style
  let containerStyles;
  if (containerSlide) {
    const containerTranslateX = interpolate(
      openValue.value,
      [0, 1],
      fromLeft ? [0, drawerWidth] : [0, -drawerWidth],
      Extrapolation.CLAMP
    );
    containerStyles = {
      transform: [{ translateX: containerTranslateX }],
    };
  }

  const closedDrawerOffset = fromLeft ? -drawerWidth : drawerWidth;

  let drawerTranslateX = 0;

  if (drawerSlide) {
    if (drawerState !== IDLE) {
      drawerTranslateX = interpolate(
        openValue.value,
        [0, 1],
        [closedDrawerOffset, 0],
        Extrapolation.CLAMP
      );
    } else {
      drawerTranslateX = drawerOpened ? 0 : closedDrawerOffset;
    }
  }

  // %% convert to animated styles
  const drawerStyles: {
    transform: { translateX: number }[];
    flexDirection: 'row-reverse' | 'row';
  } = {
    transform: [{ translateX: drawerTranslateX }],
    flexDirection: reverseContentDirection ? 'row-reverse' : 'row',
  };

  const importantForAccessibility =
    Platform.OS === 'android'
      ? drawerShown.current
        ? 'no-hide-descendants'
        : 'yes'
      : undefined;

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
      // %% ref={setPanGestureRef}
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
          importantForAccessibility={importantForAccessibility}>
          {children}
          {renderOverlay()}
        </Animated.View>
        <Animated.View
          pointerEvents="box-none"
          ref={accessibilityIsModalView}
          accessibilityViewIsModal={drawerShown.current}
          style={[styles.drawerContainer, drawerStyles, drawerContainerStyle]}>
          <Animated.View style={dynamicDrawerStyles}>
            {props.renderNavigationView(openValue)}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

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
