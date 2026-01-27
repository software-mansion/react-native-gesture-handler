import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  PressableDimensions,
  PressableEvent,
  PressableProps,
} from '../../components/Pressable/PressableProps';
import {
  Insets,
  LayoutChangeEvent,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  addInsets,
  numberAsInset,
  gestureTouchToPressableEvent,
  isTouchWithinInset,
  gestureToPressableEvent,
} from '../../components/Pressable/utils';
import {
  getStatesConfig,
  StateMachineEvent,
} from '../../components/Pressable/stateDefinitions';
import { PressableStateMachine } from '../../components/Pressable/StateMachine';
import {
  useHoverGesture,
  useLongPressGesture,
  useNativeGesture,
  useSimultaneousGestures,
} from '../hooks';
import { GestureDetector } from '../detectors';
import { PureNativeButton } from './GestureButtons';

import { PressabilityDebugView } from '../../handlers/PressabilityDebugView';
import { INT32_MAX, isTestEnv } from '../../utils';

const DEFAULT_LONG_PRESS_DURATION = 500;
const IS_TEST_ENV = isTestEnv();

const Pressable = (props: PressableProps) => {
  const {
    testOnly_pressed,
    hitSlop,
    pressRetentionOffset,
    delayHoverIn,
    delayHoverOut,
    delayLongPress,
    unstable_pressDelay,
    onHoverIn,
    onHoverOut,
    onPress,
    onPressIn,
    onPressOut,
    onLongPress,
    onLayout,
    style,
    children,
    android_disableSound,
    android_ripple,
    disabled,
    accessible,
    simultaneousWith,
    requireToFail,
    block,
    ...remainingProps
  } = props;

  const [pressedState, setPressedState] = useState(testOnly_pressed ?? false);

  const longPressTimeoutRef = useRef<number | null>(null);
  const pressDelayTimeoutRef = useRef<number | null>(null);
  const isOnPressAllowed = useRef<boolean>(true);
  const isCurrentlyPressed = useRef<boolean>(false);
  const dimensions = useRef<PressableDimensions>({
    width: 0,
    height: 0,
  });

  const normalizedHitSlop: Insets = useMemo(
    () =>
      typeof hitSlop === 'number'
        ? numberAsInset(hitSlop)
        : (hitSlop ?? numberAsInset(0)),
    [hitSlop]
  );
  const normalizedPressRetentionOffset: Insets = useMemo(
    () =>
      typeof pressRetentionOffset === 'number'
        ? numberAsInset(pressRetentionOffset)
        : (pressRetentionOffset ?? {}),
    [pressRetentionOffset]
  );
  const appliedHitSlop = addInsets(
    normalizedHitSlop,
    normalizedPressRetentionOffset
  );

  const cancelLongPress = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
      isOnPressAllowed.current = true;
    }
  }, []);

  const cancelDelayedPress = useCallback(() => {
    if (pressDelayTimeoutRef.current) {
      clearTimeout(pressDelayTimeoutRef.current);
      pressDelayTimeoutRef.current = null;
    }
  }, []);

  const startLongPress = useCallback(
    (event: PressableEvent) => {
      if (onLongPress) {
        cancelLongPress();
        longPressTimeoutRef.current = setTimeout(() => {
          isOnPressAllowed.current = false;
          onLongPress(event);
        }, delayLongPress ?? DEFAULT_LONG_PRESS_DURATION);
      }
    },
    [onLongPress, cancelLongPress, delayLongPress]
  );
  const innerHandlePressIn = useCallback(
    (event: PressableEvent) => {
      onPressIn?.(event);
      startLongPress(event);
      setPressedState(true);
      if (pressDelayTimeoutRef.current) {
        clearTimeout(pressDelayTimeoutRef.current);
        pressDelayTimeoutRef.current = null;
      }
    },
    [onPressIn, startLongPress]
  );

  const handleFinalize = useCallback(() => {
    isCurrentlyPressed.current = false;
    cancelLongPress();
    cancelDelayedPress();
    setPressedState(false);
  }, [cancelDelayedPress, cancelLongPress]);

  const handlePressIn = useCallback(
    (event: PressableEvent) => {
      if (
        !isTouchWithinInset(
          dimensions.current,
          normalizedHitSlop,
          event.nativeEvent.changedTouches.at(-1)
        )
      ) {
        // Ignoring pressIn within pressRetentionOffset
        return;
      }

      isCurrentlyPressed.current = true;
      if (unstable_pressDelay) {
        pressDelayTimeoutRef.current = setTimeout(() => {
          innerHandlePressIn(event);
        }, unstable_pressDelay);
      } else {
        innerHandlePressIn(event);
      }
    },
    [innerHandlePressIn, normalizedHitSlop, unstable_pressDelay]
  );

  const handlePressOut = useCallback(
    (event: PressableEvent, success: boolean = true) => {
      if (!isCurrentlyPressed.current) {
        // Some prop configurations may lead to handlePressOut being called mutliple times.
        return;
      }

      isCurrentlyPressed.current = false;

      if (pressDelayTimeoutRef.current) {
        innerHandlePressIn(event);
      }

      onPressOut?.(event);

      if (isOnPressAllowed.current && success) {
        onPress?.(event);
      }

      handleFinalize();
    },
    [handleFinalize, innerHandlePressIn, onPress, onPressOut]
  );

  const stateMachine = useMemo(() => new PressableStateMachine(), []);

  useEffect(() => {
    const configuration = getStatesConfig(handlePressIn, handlePressOut);
    stateMachine.setStates(configuration);
  }, [handlePressIn, handlePressOut, stateMachine]);

  const hoverInTimeout = useRef<number | null>(null);
  const hoverOutTimeout = useRef<number | null>(null);

  const hoverGesture = useHoverGesture({
    manualActivation: true, // Prevents Hover blocking Native gesture on web
    cancelsTouchesInView: false,
    onBegin: (event) => {
      if (hoverOutTimeout.current) {
        clearTimeout(hoverOutTimeout.current);
      }
      if (delayHoverIn) {
        hoverInTimeout.current = setTimeout(
          () => onHoverIn?.(gestureToPressableEvent(event)),
          delayHoverIn
        );
        return;
      }
      onHoverIn?.(gestureToPressableEvent(event));
    },
    onFinalize: (event) => {
      if (hoverInTimeout.current) {
        clearTimeout(hoverInTimeout.current);
      }
      if (delayHoverOut) {
        hoverOutTimeout.current = setTimeout(
          () => onHoverOut?.(gestureToPressableEvent(event)),
          delayHoverOut
        );
        return;
      }
      onHoverOut?.(gestureToPressableEvent(event));
    },
    enabled: disabled !== true,
    disableReanimated: true,
    simultaneousWith,
    block,
    requireToFail,
    hitSlop: appliedHitSlop,
  });

  const pressAndTouchGesture = useLongPressGesture({
    minDuration: Platform.OS === 'web' ? 0 : INT32_MAX, // Long press handles finalize on web, thus it must activate right away
    maxDistance: INT32_MAX, // Stops long press from cancelling on touch move
    cancelsTouchesInView: false,
    onTouchesDown: (event) => {
      const pressableEvent = gestureTouchToPressableEvent(event);
      stateMachine.handleEvent(
        StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
        pressableEvent
      );
    },
    onTouchesUp: () => {
      if (Platform.OS === 'android') {
        // Prevents potential soft-locks
        stateMachine.reset();
        handleFinalize();
      }
    },
    onTouchesCancel: (event) => {
      const pressableEvent = gestureTouchToPressableEvent(event);
      stateMachine.reset();
      handlePressOut(pressableEvent, false);
    },
    onFinalize: (_event, success) => {
      if (Platform.OS !== 'web') {
        return;
      }

      stateMachine.handleEvent(
        success ? StateMachineEvent.FINALIZE : StateMachineEvent.CANCEL
      );

      handleFinalize();
    },
    enabled: disabled !== true,
    disableReanimated: true,
    simultaneousWith: simultaneousWith,
    block: block,
    requireToFail: requireToFail,
    hitSlop: appliedHitSlop,
  });

  // RNButton is placed inside ButtonGesture to enable Android's ripple and to capture non-propagating events
  const buttonGesture = useNativeGesture({
    onTouchesCancel: (event) => {
      if (Platform.OS !== 'macos' && Platform.OS !== 'web') {
        // On MacOS cancel occurs in middle of gesture
        // On Web cancel occurs on mouse move, which is unwanted
        const pressableEvent = gestureTouchToPressableEvent(event);
        stateMachine.reset();
        handlePressOut(pressableEvent, false);
      }
    },
    onBegin: () => {
      stateMachine.handleEvent(StateMachineEvent.NATIVE_BEGIN);
    },
    onActivate: () => {
      if (Platform.OS !== 'android') {
        // Native.onActivate is broken with Android + hitSlop
        stateMachine.handleEvent(StateMachineEvent.NATIVE_START);
      }
    },
    onFinalize: (_event, success) => {
      // On Web we use LongPress.onFinalize instead of Native.onFinalize,
      // as Native cancels on mouse move, and LongPress does not.
      if (Platform.OS === 'web') {
        return;
      }
      stateMachine.handleEvent(
        success ? StateMachineEvent.FINALIZE : StateMachineEvent.CANCEL
      );

      if (Platform.OS !== 'ios') {
        handleFinalize();
      }
    },
    enabled: disabled !== true,
    disableReanimated: true,
    simultaneousWith,
    block,
    requireToFail,
    hitSlop: appliedHitSlop,
  });

  const gesture = useSimultaneousGestures(
    buttonGesture,
    pressAndTouchGesture,
    hoverGesture
  );

  // `cursor: 'pointer'` on `RNButton` crashes iOS
  const pointerStyle: StyleProp<ViewStyle> =
    Platform.OS === 'web' ? { cursor: 'pointer' } : {};

  const styleProp =
    typeof style === 'function' ? style({ pressed: pressedState }) : style;

  const childrenProp =
    typeof children === 'function'
      ? children({ pressed: pressedState })
      : children;

  const rippleColor = useMemo(() => {
    const defaultRippleColor = android_ripple ? undefined : 'transparent';
    return android_ripple?.color ?? defaultRippleColor;
  }, [android_ripple]);

  const setDimensions = useCallback(
    (event: LayoutChangeEvent) => {
      onLayout?.(event);
      dimensions.current = event.nativeEvent.layout;
    },
    [onLayout]
  );

  return (
    <GestureDetector gesture={gesture}>
      <PureNativeButton
        {...remainingProps}
        onLayout={setDimensions}
        accessible={accessible !== false}
        hitSlop={appliedHitSlop}
        enabled={disabled !== true}
        touchSoundDisabled={android_disableSound ?? undefined}
        rippleColor={rippleColor}
        rippleRadius={android_ripple?.radius ?? undefined}
        style={[pointerStyle, styleProp]}
        testOnly_onPress={IS_TEST_ENV ? onPress : undefined}
        testOnly_onPressIn={IS_TEST_ENV ? onPressIn : undefined}
        testOnly_onPressOut={IS_TEST_ENV ? onPressOut : undefined}
        testOnly_onLongPress={IS_TEST_ENV ? onLongPress : undefined}>
        {childrenProp}
        {__DEV__ ? (
          <PressabilityDebugView color="red" hitSlop={normalizedHitSlop} />
        ) : null}
      </PureNativeButton>
    </GestureDetector>
  );
};

export default Pressable;
