import React, { useCallback, useMemo, useRef, useState } from 'react';
import { GestureObjects as Gesture } from '../../handlers/gestures/gestureObjects';
import { GestureDetector } from '../../handlers/gestures/GestureDetector';
import { PressableEvent, PressableProps } from './PressableProps';
import {
  Insets,
  Platform,
  StyleProp,
  ViewStyle,
  processColor,
} from 'react-native';
import NativeButton from '../GestureHandlerButton';
import {
  gestureToPressableEvent,
  addInsets,
  numberAsInset,
  gestureTouchToPressableEvent,
} from './utils';
import { PressabilityDebugView } from '../../handlers/PressabilityDebugView';
import { INT32_MAX, isFabric, isTestEnv } from '../../utils';
import {
  applyRelationProp,
  RelationPropName,
  RelationPropType,
} from '../utils';
import { StateMachine } from './StateMachine';

const DEFAULT_LONG_PRESS_DURATION = 500;
const IS_TEST_ENV = isTestEnv();

let IS_FABRIC: null | boolean = null;

enum Signal {
  NATIVE_BEGIN = 'nativeBegin',
  NATIVE_START = 'nativeStart',
  NATIVE_END = 'nativeEnd',
  LONG_PRESS_TOUCHES_DOWN = 'longPressTouchesDown',
  LONG_PRESS_START = 'longPressStart',
  LONG_PRESS_END = 'longPressEnd',
}

const Pressable = (props: PressableProps) => {
  const {
    testID,
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

  const [pressedState, setPressedState] = useState(testOnly_pressed ?? false);

  const longPressTimeoutRef = useRef<number | null>(null);
  const pressDelayTimeoutRef = useRef<number | null>(null);
  const isOnPressAllowed = useRef<boolean>(true);

  const cancelLongPress = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
      isOnPressAllowed.current = true;
    }
  }, []);

  const cancelDelayedPress = useCallback(() => {
    cancelLongPress();
    if (pressDelayTimeoutRef.current) {
      clearTimeout(pressDelayTimeoutRef.current);
      pressDelayTimeoutRef.current = null;
    }
  }, [cancelLongPress]);

  const startLongPress = useCallback(
    (event: PressableEvent) => {
      if (onLongPress) {
        cancelLongPress();
        longPressTimeoutRef.current = setTimeout(() => {
          // fixme: onLongPress can become stale during timeout - use up-to-date cb (ref should work)
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
    },
    [onPressIn, startLongPress]
  );

  const handleFinalize = useCallback(() => {
    /* dbg */ console.log(testID, 'Finalizing');
    cancelLongPress();
    cancelDelayedPress();
    setPressedState(false);
  }, [cancelDelayedPress, cancelLongPress, testID]);

  const handlePressIn = useCallback(
    (event: PressableEvent) => {
      if (unstable_pressDelay) {
        pressDelayTimeoutRef.current = setTimeout(() => {
          innerHandlePressIn(event);
        }, unstable_pressDelay);
      } else {
        innerHandlePressIn(event);
      }
    },
    [innerHandlePressIn, unstable_pressDelay]
  );

  const handlePressOut = useCallback(
    (event: PressableEvent) => {
      onPressOut?.(event);
      if (isOnPressAllowed.current) {
        onPress?.(event);
      }
      handleFinalize();
    },
    [handleFinalize, onPress, onPressOut]
  );

  const stateMachine = useMemo(() => {
    if (IS_FABRIC === null) {
      IS_FABRIC = isFabric();
    }

    if (Platform.OS === 'android') {
      return new StateMachine(
        [
          {
            signal: Signal.NATIVE_BEGIN,
          },
          {
            signal: Signal.LONG_PRESS_TOUCHES_DOWN,
            callback: handlePressIn,
          },
          {
            signal: Signal.NATIVE_START,
          },
          {
            signal: Signal.NATIVE_END,
            callback: handlePressOut,
          },
        ],
        /* dbg */ testID as string
      );
    } else if (Platform.OS === 'ios') {
      return new StateMachine(
        [
          {
            signal: Signal.LONG_PRESS_TOUCHES_DOWN,
          },
          {
            signal: Signal.NATIVE_START,
            callback: handlePressIn,
          },
          {
            signal: Signal.NATIVE_END,
            callback: handlePressOut,
          },
        ],
        /* dbg */ testID as string
      );
    } else if (Platform.OS === 'web') {
      return new StateMachine(
        [
          {
            signal: Signal.NATIVE_BEGIN,
          },
          {
            signal: Signal.NATIVE_START,
          },
          {
            signal: Signal.LONG_PRESS_TOUCHES_DOWN,
            callback: handlePressIn,
          },
          {
            signal: Signal.NATIVE_END,
            callback: handlePressOut,
          },
        ],
        /* dbg */ testID as string
      );
    } else if (Platform.OS === 'macos') {
      return new StateMachine(
        [
          {
            signal: Signal.LONG_PRESS_TOUCHES_DOWN,
          },
          {
            signal: Signal.NATIVE_BEGIN,
            callback: handlePressIn,
          },
          {
            signal: Signal.NATIVE_START,
          },
          {
            signal: Signal.NATIVE_END,
            callback: handlePressOut,
          },
        ],
        /* dbg */ testID as string
      );
    } else {
      // Unknown platform - using minimal universal setup.
      return new StateMachine(
        [
          {
            signal: Signal.NATIVE_END,
            callback: (event: PressableEvent) => {
              handlePressIn(event);
              handlePressOut(event);
            },
          },
        ],
        /* dbg */ testID as string
      );
    }
  }, [handlePressOut, handlePressIn, testID]);

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
          const pEvent = gestureTouchToPressableEvent(event);
          stateMachine.setEvent(pEvent);
          stateMachine.sendSignal(Signal.LONG_PRESS_TOUCHES_DOWN);
        })
        .onTouchesUp(() => {
          if (Platform.OS === 'android') {
            // prevents potential soft-locks
            stateMachine.reset();
            handleFinalize();
          }
        })
        .onTouchesCancelled(() => {
          stateMachine.reset();
          handleFinalize();
        })
        .onStart((event) => {
          const pEvent = gestureToPressableEvent(event);
          stateMachine.setEvent(pEvent);
          stateMachine.sendSignal(Signal.LONG_PRESS_START);
        })
        .onEnd((event) => {
          const pEvent = gestureToPressableEvent(event);
          stateMachine.setEvent(pEvent);
          stateMachine.sendSignal(Signal.LONG_PRESS_END);
        }),
    [stateMachine, handleFinalize]
  );

  // RNButton is placed inside ButtonGesture to enable Android's ripple and to capture non-propagating events
  const buttonGesture = useMemo(
    () =>
      Gesture.Native()
        .onTouchesCancelled(() => {
          if (Platform.OS !== 'macos') {
            // on MacOS cancel occurs in middle of gesture
            /* dbg */ console.log(testID, 'Native touches cancel');
            stateMachine.reset();
            handleFinalize();
          }
        })
        .onBegin(() => {
          stateMachine.sendSignal(Signal.NATIVE_BEGIN);
        })
        .onStart(() => {
          stateMachine.sendSignal(Signal.NATIVE_START);
        })
        .onEnd(() => {
          stateMachine.sendSignal(Signal.NATIVE_END);
          handleFinalize(); // common ending point for all platforms
        }),
    [stateMachine, testID, handleFinalize]
  );

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

  const isPressableEnabled = disabled !== true;

  const gestures = [buttonGesture, pressAndTouchGesture, hoverGesture];

  for (const gesture of gestures) {
    gesture.enabled(isPressableEnabled);
    gesture.runOnJS(true);
    gesture.hitSlop(appliedHitSlop);
    gesture.shouldCancelWhenOutside(Platform.OS === 'web' ? false : true);

    Object.entries(relationProps).forEach(([relationName, relation]) => {
      applyRelationProp(
        gesture,
        relationName as RelationPropName,
        relation as RelationPropType
      );
    });
  }

  // Uses different hitSlop, to activate on hitSlop area instead of pressRetentionOffset area
  buttonGesture.hitSlop(normalizedHitSlop);

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
