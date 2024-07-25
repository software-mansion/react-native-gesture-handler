import React, { useCallback, useMemo, useRef, useState } from 'react';
import { GestureObjects as Gesture } from '../../handlers/gestures/gestureObjects';
import { GestureDetector } from '../../handlers/gestures/GestureDetector';
import { PressableEvent, PressableProps } from './PressableProps';
import {
  Insets,
  Platform,
  StyleProp,
  View,
  ViewStyle,
  processColor,
  StyleSheet,
} from 'react-native';
import NativeButton from '../GestureHandlerButton';
import {
  numberAsInset,
  gestureToPressableEvent,
  isTouchWithinInset,
  gestureTouchToPressableEvent,
  addInsets,
  splitStyles,
} from './utils';
import { PressabilityDebugView } from '../../handlers/PressabilityDebugView';
import { GestureTouchEvent } from '../../handlers/gestureHandlerCommon';

const DEFAULT_LONG_PRESS_DURATION = 500;

export default function Pressable(props: PressableProps) {
  const [pressedState, setPressedState] = useState(
    props.testOnly_pressed ?? false
  );

  const pressableRef = useRef<View>(null);

  // Disabled when onLongPress has been called
  const isPressCallbackEnabled = useRef<boolean>(true);
  const hasPassedBoundsChecks = useRef<boolean>(false);
  const shouldPreventNativeEffects = useRef<boolean>(false);

  const normalizedHitSlop: Insets = useMemo(
    () =>
      typeof props.hitSlop === 'number'
        ? numberAsInset(props.hitSlop)
        : props.hitSlop ?? {},
    [props.hitSlop]
  );

  const normalizedPressRetentionOffset: Insets = useMemo(
    () =>
      typeof props.pressRetentionOffset === 'number'
        ? numberAsInset(props.pressRetentionOffset)
        : props.pressRetentionOffset ?? {},
    [props.pressRetentionOffset]
  );

  const hoverInTimeout = useRef<number | null>(null);
  const hoverOutTimeout = useRef<number | null>(null);

  const hoverGesture = useMemo(
    () =>
      Gesture.Hover()
        .manualActivation(true) // Stops Hover from blocking Native gesture activation on web
        .cancelsTouchesInView(false)
        .onBegin((event) => {
          if (hoverOutTimeout.current) {
            clearTimeout(hoverOutTimeout.current);
          }
          if (props.delayHoverIn) {
            hoverInTimeout.current = setTimeout(
              () => props.onHoverIn?.(gestureToPressableEvent(event)),
              props.delayHoverIn
            );
            return;
          }
          props.onHoverIn?.(gestureToPressableEvent(event));
        })
        .onFinalize((event) => {
          if (hoverInTimeout.current) {
            clearTimeout(hoverInTimeout.current);
          }
          if (props.delayHoverOut) {
            hoverOutTimeout.current = setTimeout(
              () => props.onHoverOut?.(gestureToPressableEvent(event)),
              props.delayHoverOut
            );
            return;
          }
          props.onHoverOut?.(gestureToPressableEvent(event));
        }),
    [props]
  );

  const pressDelayTimeoutRef = useRef<number | null>(null);
  const isTouchPropagationAllowed = useRef<boolean>(false);

  // iOS only: due to varying flow of gestures, events sometimes have to be saved for later use
  const deferredEventPayload = useRef<PressableEvent | null>(null);

  const pressInHandler = useCallback(
    (event: PressableEvent) => {
      if (handlingOnTouchesDown.current) {
        deferredEventPayload.current = event;
      }

      if (!isTouchPropagationAllowed.current) {
        return;
      }

      deferredEventPayload.current = null;

      props.onPressIn?.(event);
      isPressCallbackEnabled.current = true;
      pressDelayTimeoutRef.current = null;
      setPressedState(true);
    },
    [props]
  );

  const pressOutHandler = useCallback(
    (event: PressableEvent) => {
      if (
        !hasPassedBoundsChecks.current ||
        event.nativeEvent.touches.length >
          event.nativeEvent.changedTouches.length
      ) {
        return;
      }

      if (props.unstable_pressDelay && pressDelayTimeoutRef.current !== null) {
        // When delay is preemptively finished by lifting touches,
        // we want to immediately activate it's effects - pressInHandler,
        // even though we are located at the pressOutHandler
        clearTimeout(pressDelayTimeoutRef.current);
        pressInHandler(event);
      }

      if (deferredEventPayload.current) {
        props.onPressIn?.(deferredEventPayload.current);
        deferredEventPayload.current = null;
      }

      props.onPressOut?.(event);

      if (isPressCallbackEnabled.current) {
        props.onPress?.(event);
      }

      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }

      isTouchPropagationAllowed.current = false;
      hasPassedBoundsChecks.current = false;
      isPressCallbackEnabled.current = true;
      setPressedState(false);
    },
    [pressInHandler, props]
  );

  const handlingOnTouchesDown = useRef<boolean>(false);
  const onEndHandlingTouchesDown = useRef<(() => void) | null>(null);
  const cancelledMidPress = useRef<boolean>(false);

  const activateLongPress = useCallback(
    (event: GestureTouchEvent) => {
      if (!isTouchPropagationAllowed.current) {
        return;
      }

      if (hasPassedBoundsChecks.current) {
        props.onLongPress?.(gestureTouchToPressableEvent(event));
        isPressCallbackEnabled.current = false;
      }

      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    },
    [props]
  );

  const longPressTimeoutRef = useRef<number | null>(null);
  const longPressMinDuration =
    (props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION) +
    (props.unstable_pressDelay ?? 0);

  const pressAndTouchGesture = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(Number.MAX_SAFE_INTEGER) // Stops long press from blocking native gesture
        .maxDistance(Number.MAX_SAFE_INTEGER) // Stops long press from cancelling after set distance
        .cancelsTouchesInView(false)
        .onTouchesDown((event) => {
          handlingOnTouchesDown.current = true;
          pressableRef.current?.measure((_x, _y, width, height) => {
            if (
              !isTouchWithinInset(
                {
                  width,
                  height,
                },
                normalizedHitSlop,
                event.changedTouches.at(-1)
              ) ||
              hasPassedBoundsChecks.current ||
              cancelledMidPress.current
            ) {
              cancelledMidPress.current = false;
              onEndHandlingTouchesDown.current = null;
              handlingOnTouchesDown.current = false;
              return;
            }

            hasPassedBoundsChecks.current = true;

            // In case of multiple touches, the first one starts long press gesture
            if (longPressTimeoutRef.current === null) {
              // Start long press gesture timer
              longPressTimeoutRef.current = setTimeout(
                () => activateLongPress(event),
                longPressMinDuration
              );
            }

            if (props.unstable_pressDelay) {
              pressDelayTimeoutRef.current = setTimeout(() => {
                pressInHandler(gestureTouchToPressableEvent(event));
              }, props.unstable_pressDelay);
            } else {
              pressInHandler(gestureTouchToPressableEvent(event));
            }

            onEndHandlingTouchesDown.current?.();
            onEndHandlingTouchesDown.current = null;
            handlingOnTouchesDown.current = false;
          });
        })
        .onTouchesUp((event) => {
          if (handlingOnTouchesDown.current) {
            onEndHandlingTouchesDown.current = () =>
              pressOutHandler(gestureTouchToPressableEvent(event));
            return;
          }
          // On iOS, short taps will make LongPress gesture call onTouchesUp before Native gesture calls onStart
          // This variable ensures that onStart isn't detected as the first gesture since Pressable is pressed.
          if (deferredEventPayload.current !== null) {
            shouldPreventNativeEffects.current = true;
          }
          pressOutHandler(gestureTouchToPressableEvent(event));
        })
        .onTouchesCancelled((event) => {
          isPressCallbackEnabled.current = false;

          if (handlingOnTouchesDown.current) {
            cancelledMidPress.current = true;
            onEndHandlingTouchesDown.current = () =>
              pressOutHandler(gestureTouchToPressableEvent(event));
            return;
          }

          if (
            !hasPassedBoundsChecks.current ||
            event.allTouches.length > event.changedTouches.length
          ) {
            return;
          }

          pressOutHandler(gestureTouchToPressableEvent(event));
        }),
    [
      activateLongPress,
      longPressMinDuration,
      normalizedHitSlop,
      pressInHandler,
      pressOutHandler,
      props.unstable_pressDelay,
    ]
  );

  // RNButton is placed inside ButtonGesture to enable Android's ripple and to capture non-propagating events
  const buttonGesture = useMemo(
    () =>
      Gesture.Native()
        .onBegin(() => {
          // Android sets BEGAN state on press down
          if (Platform.OS === 'android') {
            isTouchPropagationAllowed.current = true;
          }
        })
        .onStart(() => {
          if (Platform.OS === 'web') {
            isTouchPropagationAllowed.current = true;
          }

          // iOS sets ACTIVE state on press down
          if (Platform.OS !== 'ios') {
            return;
          }

          if (deferredEventPayload.current) {
            isTouchPropagationAllowed.current = true;

            if (hasPassedBoundsChecks.current) {
              pressInHandler(deferredEventPayload.current);
              deferredEventPayload.current = null;
            } else {
              pressOutHandler(deferredEventPayload.current);
              isTouchPropagationAllowed.current = false;
            }

            return;
          }

          if (hasPassedBoundsChecks.current) {
            isTouchPropagationAllowed.current = true;
            return;
          }

          if (shouldPreventNativeEffects.current) {
            shouldPreventNativeEffects.current = false;
            return;
          }

          isTouchPropagationAllowed.current = true;
        }),
    [pressInHandler, pressOutHandler]
  );

  const appliedHitSlop = addInsets(
    normalizedHitSlop,
    normalizedPressRetentionOffset
  );

  const isPressableEnabled = props.disabled !== true;

  const gestures = [pressAndTouchGesture, hoverGesture, buttonGesture];

  for (const gesture of gestures) {
    gesture.enabled(isPressableEnabled);
    gesture.runOnJS(true);
    gesture.hitSlop(appliedHitSlop);
    gesture.shouldCancelWhenOutside(false);

    if (Platform.OS !== 'web') {
      gesture.shouldCancelWhenOutside(true);
    }
  }

  // Uses different hitSlop, to activate on hitSlop area instead of pressRetentionOffset area
  buttonGesture.hitSlop(normalizedHitSlop);

  const gesture = Gesture.Simultaneous(...gestures);

  const defaultRippleColor = props.android_ripple ? undefined : 'transparent';

  // `cursor: 'pointer'` on `RNButton` crashes iOS
  const pointerStyle: StyleProp<ViewStyle> =
    Platform.OS === 'web' ? { cursor: 'pointer' } : {};

  const styleProp =
    typeof props.style === 'function'
      ? props.style({ pressed: pressedState })
      : props.style;

  const childrenProp =
    typeof props.children === 'function'
      ? props.children({ pressed: pressedState })
      : props.children;

  const flattenedStyles = StyleSheet.flatten(styleProp ?? {});

  const [innerStyles, outerStyles] = splitStyles(flattenedStyles);

  return (
    <View style={outerStyles}>
      <GestureDetector gesture={gesture}>
        <NativeButton
          ref={pressableRef}
          testID={props.testID}
          hitSlop={appliedHitSlop}
          enabled={isPressableEnabled}
          touchSoundDisabled={props.android_disableSound ?? undefined}
          rippleColor={processColor(
            props.android_ripple?.color ?? defaultRippleColor
          )}
          rippleRadius={props.android_ripple?.radius ?? undefined}
          style={[StyleSheet.absoluteFill, pointerStyle, innerStyles]}>
          {childrenProp}
          {__DEV__ ? (
            <PressabilityDebugView color="red" hitSlop={normalizedHitSlop} />
          ) : null}
        </NativeButton>
      </GestureDetector>
    </View>
  );
}
