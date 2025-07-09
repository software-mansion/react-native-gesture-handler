import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GestureObjects as Gesture } from '../../handlers/gestures/gestureObjects';
import { GestureDetector } from '../../handlers/gestures/GestureDetector';
import {
  PressableEvent,
  PressableProps,
  PressableDimensions,
} from './PressableProps';
import {
  Insets,
  Platform,
  StyleProp,
  View,
  ViewStyle,
  processColor,
} from 'react-native';
import NativeButton from '../GestureHandlerButton';
import {
  gestureToPressableEvent,
  addInsets,
  numberAsInset,
  gestureTouchToPressableEvent,
  isTouchWithinInset,
} from './utils';
import { PressabilityDebugView } from '../../handlers/PressabilityDebugView';
import { INT32_MAX, isFabric, isTestEnv } from '../../utils';
import {
  applyRelationProp,
  RelationPropName,
  RelationPropType,
} from '../utils';
import { getStatesConfig, StateMachineEvent } from './stateDefinitions';
import { PressableStateMachine } from './StateMachine';

const DEFAULT_LONG_PRESS_DURATION = 500;
const IS_TEST_ENV = isTestEnv();

let IS_FABRIC: null | boolean = null;

const Pressable = (props: PressableProps) => {
  const {
    ref,
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
    style,
    children,
    android_disableSound,
    android_ripple,
    disabled,
    accessible,
    simultaneousWithExternalGesture,
    requireExternalGestureToFail,
    blocksExternalGesture,
    ...remainingProps
  } = props;

  const relationProps = {
    simultaneousWithExternalGesture,
    requireExternalGestureToFail,
    blocksExternalGesture,
  };

  // used only if `ref` is undefined
  const fallbackRef = useRef<View>(null);

  const [pressedState, setPressedState] = useState(testOnly_pressed ?? false);

  const longPressTimeoutRef = useRef<number | null>(null);
  const pressDelayTimeoutRef = useRef<number | null>(null);
  const isOnPressAllowed = useRef<boolean>(true);
  const isCurrentlyPressed = useRef<boolean>(false);
  const dimensions = useRef<PressableDimensions>({ width: 0, height: 0 });

  const normalizedHitSlop: Insets = useMemo(
    () =>
      typeof hitSlop === 'number' ? numberAsInset(hitSlop) : (hitSlop ?? {}),
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

  const hoverGesture = useMemo(
    () =>
      Gesture.Hover()
        .manualActivation(true) // Prevents Hover blocking Gesture.Native() on web
        .cancelsTouchesInView(false)
        .onBegin((event) => {
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
        })
        .onFinalize((event) => {
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
        }),
    [delayHoverIn, delayHoverOut, onHoverIn, onHoverOut]
  );

  const pressAndTouchGesture = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(INT32_MAX) // Stops long press from blocking Gesture.Native()
        .maxDistance(INT32_MAX) // Stops long press from cancelling on touch move
        .cancelsTouchesInView(false)
        .onTouchesDown((event) => {
          const pressableEvent = gestureTouchToPressableEvent(event);
          stateMachine.handleEvent(
            StateMachineEvent.LONG_PRESS_TOUCHES_DOWN,
            pressableEvent
          );
        })
        .onTouchesUp(() => {
          if (Platform.OS === 'android') {
            // Prevents potential soft-locks
            stateMachine.reset();
            handleFinalize();
          }
        })
        .onTouchesCancelled((event) => {
          const pressableEvent = gestureTouchToPressableEvent(event);
          stateMachine.reset();
          handlePressOut(pressableEvent, false);
        })
        .onFinalize(() => {
          if (Platform.OS === 'web') {
            stateMachine.handleEvent(StateMachineEvent.FINALIZE);
            handleFinalize();
          }
        }),
    [stateMachine, handleFinalize, handlePressOut]
  );

  // RNButton is placed inside ButtonGesture to enable Android's ripple and to capture non-propagating events
  const buttonGesture = useMemo(
    () =>
      Gesture.Native()
        .onTouchesCancelled((event) => {
          if (Platform.OS !== 'macos' && Platform.OS !== 'web') {
            // On MacOS cancel occurs in middle of gesture
            // On Web cancel occurs on mouse move, which is unwanted
            const pressableEvent = gestureTouchToPressableEvent(event);
            stateMachine.reset();
            handlePressOut(pressableEvent, false);
          }
        })
        .onBegin(() => {
          stateMachine.handleEvent(StateMachineEvent.NATIVE_BEGIN);
        })
        .onStart(() => {
          if (Platform.OS !== 'android') {
            // Gesture.Native().onStart() is broken with Android + hitSlop
            stateMachine.handleEvent(StateMachineEvent.NATIVE_START);
          }
        })
        .onFinalize(() => {
          if (Platform.OS !== 'web') {
            // On Web we use LongPress().onFinalize() instead of Native().onFinalize(),
            // as Native cancels on mouse move, and LongPress does not.
            stateMachine.handleEvent(StateMachineEvent.FINALIZE);
            handleFinalize();
          }
        }),
    [stateMachine, handlePressOut, handleFinalize]
  );

  const isPressableEnabled = disabled !== true;

  const gestures = [buttonGesture, pressAndTouchGesture, hoverGesture];

  for (const gesture of gestures) {
    gesture.enabled(isPressableEnabled);
    gesture.runOnJS(true);
    gesture.hitSlop(appliedHitSlop);
    gesture.shouldCancelWhenOutside(Platform.OS !== 'web');

    Object.entries(relationProps).forEach(([relationName, relation]) => {
      applyRelationProp(
        gesture,
        relationName as RelationPropName,
        relation as RelationPropType
      );
    });
  }

  const gesture = Gesture.Simultaneous(...gestures);

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
    if (IS_FABRIC === null) {
      IS_FABRIC = isFabric();
    }

    const defaultRippleColor = android_ripple ? undefined : 'transparent';
    const unprocessedRippleColor = android_ripple?.color ?? defaultRippleColor;
    return IS_FABRIC
      ? unprocessedRippleColor
      : processColor(unprocessedRippleColor);
  }, [android_ripple]);

  return (
    <GestureDetector gesture={gesture}>
      <NativeButton
        {...remainingProps}
        // @ts-ignore Prop `onLayout` always works. Todo: Define it's availability on NativeButton
        onLayout={(e) => (dimensions.current = e.nativeEvent.layout)}
        ref={ref ?? fallbackRef}
        accessible={accessible !== false}
        hitSlop={appliedHitSlop}
        enabled={isPressableEnabled}
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
      </NativeButton>
    </GestureDetector>
  );
};

export default Pressable;
