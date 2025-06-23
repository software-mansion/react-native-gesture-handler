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
import { gestureToPressableEvent, addInsets, numberAsInset } from './utils';
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
  NATIVE_TOUCH_DOWN = 'nativeTouchDown',
  NATIVE_TOUCH_UP = 'nativeTouchUp',
  LONG_PRESS_BEGIN = 'longPressBegin',
  LONG_PRESS_START = 'longPressStart',
  LONG_PRESS_END = 'longPressEnd',
  LONG_PRESS_TOUCH_DOWN = 'longPressTouchDown',
  LONG_PRESS_TOUCH_UP = 'longPressTouchUp',
}

const PressableStateful = (props: PressableProps) => {
  // fixme: add ref prop, likely should be inherited from a higher order class
  const {
    testID,
    testOnly_pressed,
    hitSlop,
    pressRetentionOffset,
    delayHoverIn,
    delayHoverOut,
    delayLongPress,
    // unstable_pressDelay,
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
  const isOnPressAllowed = useRef<boolean>(true);

  const cancelLongPress = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
      isOnPressAllowed.current = true;
    }
  }, []);

  const startLongPress = useCallback(
    (event: PressableEvent) => {
      if (onLongPress) {
        cancelLongPress();
        longPressTimeoutRef.current = setTimeout(() => {
          // fixme: onLongPress can be stale - use up-to-date cb (ref should work)
          isOnPressAllowed.current = false;
          onLongPress(event);
        }, delayLongPress ?? DEFAULT_LONG_PRESS_DURATION);
      }
    },
    [onLongPress, cancelLongPress, delayLongPress]
  );

  const handlePressIn = useCallback(
    (event: PressableEvent) => {
      onPressIn?.(event);
      startLongPress(event);
      setPressedState(true);
    },
    [onPressIn, startLongPress]
  );

  const handlePress = useCallback(
    (event: PressableEvent) => {
      if (isOnPressAllowed.current) {
        onPress?.(event);
      }
      cancelLongPress();
    },
    [cancelLongPress, onPress]
  );

  const handleFinalize = useCallback(() => {
    cancelLongPress();
    setPressedState(false);
  }, [cancelLongPress]);

  const stateMachine = useMemo(
    () =>
      new StateMachine(
        [
          {
            isActive: Platform.OS === 'android',
            steps: [
              {
                signal: Signal.NATIVE_BEGIN,
              },
              {
                signal: Signal.NATIVE_TOUCH_DOWN,
              },
              {
                signal: Signal.LONG_PRESS_BEGIN,
                callbacks: [handlePressIn],
              },
              {
                signal: Signal.LONG_PRESS_TOUCH_DOWN,
              },
              {
                signal: Signal.NATIVE_START,
              },
              {
                signal: Signal.NATIVE_END,
              },
              {
                signal: Signal.LONG_PRESS_TOUCH_UP,
                callbacks: [
                  (event) => {
                    handlePress(event);
                    onPressOut?.(event);
                    handleFinalize();
                  },
                ],
              },
            ],
          },
          {
            isActive: Platform.OS === 'ios' && isFabric(),
            steps: [
              {
                signal: Signal.LONG_PRESS_TOUCH_DOWN,
              },
              {
                signal: Signal.LONG_PRESS_BEGIN,
                callbacks: [handlePressIn],
              },
              {
                signal: Signal.NATIVE_START,
              },
              {
                signal: Signal.NATIVE_END,
                callbacks: [
                  (event) => {
                    handlePress(event);
                    onPressOut?.(event);
                    handleFinalize();
                  },
                ],
              },
            ],
          },
          {
            isActive: Platform.OS === 'web',
            steps: [
              {
                signal: Signal.NATIVE_BEGIN,
              },
              {
                signal: Signal.NATIVE_START,
              },
              {
                signal: Signal.NATIVE_TOUCH_DOWN,
              },
              {
                signal: Signal.LONG_PRESS_BEGIN,
                callbacks: [handlePressIn],
              },
              {
                signal: Signal.LONG_PRESS_TOUCH_DOWN,
              },
              {
                signal: Signal.NATIVE_TOUCH_UP,
              },
              {
                signal: Signal.NATIVE_END,
              },
              {
                signal: Signal.LONG_PRESS_TOUCH_UP,
                callbacks: [
                  (event) => {
                    handlePress(event);
                    onPressOut?.(event);
                    handleFinalize();
                  },
                ],
              },
            ],
          },
        ],
        /* dbg, remove */ testID
      ),
    [handleFinalize, handlePress, onPressOut, handlePressIn, testID]
  );

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
        .onTouchesDown(() => {
          stateMachine.sendSignal(Signal.LONG_PRESS_TOUCH_DOWN);
        })
        .onTouchesUp(() => {
          if (Platform.OS !== 'ios') {
            stateMachine.sendSignal(Signal.LONG_PRESS_TOUCH_UP);
          }

          if (Platform.OS === 'android') {
            // prevents potential soft-locks
            stateMachine.reset();
            handleFinalize();
          }
        })
        .onTouchesCancelled(() => {
          /* dbg */ console.log('Long press touches cancel');
          stateMachine.reset();
          handleFinalize();
        })
        .onBegin((event) => {
          const gEvent = gestureToPressableEvent(event);
          stateMachine.setEvent(gEvent);
          stateMachine.sendSignal(Signal.LONG_PRESS_BEGIN);
        })
        .onStart((event) => {
          const gEvent = gestureToPressableEvent(event);
          stateMachine.setEvent(gEvent);
          stateMachine.sendSignal(Signal.LONG_PRESS_START);
        })
        .onEnd((event) => {
          const gEvent = gestureToPressableEvent(event);
          stateMachine.setEvent(gEvent);
          stateMachine.sendSignal(Signal.LONG_PRESS_END);
        }),
    [stateMachine, handleFinalize]
  );

  // RNButton is placed inside ButtonGesture to enable Android's ripple and to capture non-propagating events
  const buttonGesture = useMemo(
    () =>
      Gesture.Native()
        // todo: onTouches* could provide useful event data, if we ever encounter an impossible order edge-case
        .onTouchesDown(() => {
          stateMachine.sendSignal(Signal.NATIVE_TOUCH_DOWN);
        })
        .onTouchesUp(() => {
          if (Platform.OS !== 'android') {
            // conflicts with Gesture.Native().onStart() on android
            stateMachine.sendSignal(Signal.NATIVE_TOUCH_UP);
          }
        })
        .onTouchesCancelled(() => {
          /* dbg */ console.log('Native touches cancel');
          stateMachine.reset();
          handleFinalize();
        })
        .onBegin(() => {
          stateMachine.sendSignal(Signal.NATIVE_BEGIN);
        })
        .onStart(() => {
          stateMachine.sendSignal(Signal.NATIVE_START);
        })
        .onEnd(() => {
          stateMachine.sendSignal(Signal.NATIVE_END);
          if (Platform.OS === 'ios') {
            // prevents potential soft-locks
            stateMachine.reset();
            handleFinalize();
          }
        }),
    [stateMachine, handleFinalize]
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

export default PressableStateful;
