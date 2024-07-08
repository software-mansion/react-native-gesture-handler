import React, { useCallback, useMemo, useRef, useState } from 'react';
import { GestureObjects as Gesture } from '../../handlers/gestures/gestureObjects';
import { GestureDetector } from '../../handlers/gestures/GestureDetector';
import { PressableProps } from './PressableProps';
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
  adaptStateChangeEvent,
  isTouchWithinInset,
  adaptTouchEvent,
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
  const isPressedDown = useRef<boolean>(false);

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

  const pressGesture = useMemo(
    () =>
      Gesture.LongPress().onStart((event) => {
        if (isPressedDown.current) {
          props.onLongPress?.(adaptStateChangeEvent(event));
          isPressCallbackEnabled.current = false;
        }
      }),
    [props]
  );

  const hoverInTimeout = useRef<number | null>(null);
  const hoverOutTimeout = useRef<number | null>(null);

  const hoverGesture = useMemo(
    () =>
      Gesture.Hover()
        .onBegin((event) => {
          if (hoverOutTimeout.current) {
            clearTimeout(hoverOutTimeout.current);
          }
          if (props.delayHoverIn) {
            hoverInTimeout.current = setTimeout(
              () => props.onHoverIn?.(adaptStateChangeEvent(event)),
              props.delayHoverIn
            );
            return;
          }
          props.onHoverIn?.(adaptStateChangeEvent(event));
        })
        .onEnd((event) => {
          if (hoverInTimeout.current) {
            clearTimeout(hoverInTimeout.current);
          }
          if (props.delayHoverOut) {
            hoverOutTimeout.current = setTimeout(
              () => props.onHoverOut?.(adaptStateChangeEvent(event)),
              props.delayHoverOut
            );
            return;
          }
          props.onHoverOut?.(adaptStateChangeEvent(event));
        }),
    [props]
  );

  const pressDelayTimeoutRef = useRef<number | null>(null);
  const pressInHandler = useCallback(
    (event: GestureTouchEvent) => {
      props.onPressIn?.(adaptTouchEvent(event));
      isPressCallbackEnabled.current = true;
      pressDelayTimeoutRef.current = null;
      setPressedState(true);
    },
    [props]
  );

  const pressOutHandler = useCallback(
    (event: GestureTouchEvent) => {
      if (
        !isPressedDown.current ||
        event.allTouches.length > event.changedTouches.length
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

      props.onPressOut?.(adaptTouchEvent(event));

      if (isPressCallbackEnabled.current) {
        props.onPress?.(adaptTouchEvent(event));
      }

      isPressedDown.current = false;
      setPressedState(false);
    },
    [pressInHandler, props]
  );

  const handlingOnTouchesDown = useRef<boolean>(false);
  const onEndHandlingTouchesDown = useRef<(() => void) | null>(null);
  const cancelledMidPress = useRef<boolean>(false);

  const touchGesture = useMemo(
    () =>
      Gesture.Manual()
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
              isPressedDown.current ||
              cancelledMidPress.current
            ) {
              cancelledMidPress.current = false;
              onEndHandlingTouchesDown.current = null;
              handlingOnTouchesDown.current = false;
              return;
            }

            isPressedDown.current = true;

            if (props.unstable_pressDelay) {
              pressDelayTimeoutRef.current = setTimeout(() => {
                pressInHandler(event);
              }, props.unstable_pressDelay);
            } else {
              pressInHandler(event);
            }

            onEndHandlingTouchesDown.current?.();
            onEndHandlingTouchesDown.current = null;
            handlingOnTouchesDown.current = false;
          });
        })
        .onTouchesUp((event) => {
          if (handlingOnTouchesDown.current) {
            onEndHandlingTouchesDown.current = () => pressOutHandler(event);
            return;
          }

          pressOutHandler(event);
        })
        .onTouchesCancelled((event) => {
          if (handlingOnTouchesDown.current) {
            cancelledMidPress.current = true;
            onEndHandlingTouchesDown.current = () => pressOutHandler(event);
            return;
          }

          if (
            !isPressedDown.current ||
            event.allTouches.length > event.changedTouches.length
          ) {
            return;
          }

          pressOutHandler(event);
        }),
    [
      normalizedHitSlop,
      props.unstable_pressDelay,
      pressInHandler,
      pressOutHandler,
    ]
  );

  // rippleGesture lives inside RNButton to enable android's ripple
  const rippleGesture = useMemo(() => Gesture.Native(), []);

  pressGesture.minDuration(
    (props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION) +
      (props.unstable_pressDelay ?? 0)
  );

  const appliedHitSlop = addInsets(
    normalizedHitSlop,
    normalizedPressRetentionOffset
  );

  const isPressableEnabled = props.disabled !== true;

  const gestures = [touchGesture, pressGesture, hoverGesture, rippleGesture];

  for (const gesture of gestures) {
    gesture.enabled(isPressableEnabled);
    gesture.runOnJS(true);
    gesture.hitSlop(appliedHitSlop);

    if (Platform.OS !== 'web') {
      gesture.shouldCancelWhenOutside(true);
    }
  }

  // Uses different hitSlop, to activate on hitSlop area instead of pressRetentionOffset area
  rippleGesture.hitSlop(normalizedHitSlop);

  const gesture = Gesture.Simultaneous(
    hoverGesture,
    pressGesture,
    touchGesture,
    rippleGesture
  );

  const defaultRippleColor = props.android_ripple ? undefined : 'transparent';

  // `cursor: 'pointer'` on `RNButton` crashes IOS
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

  const flattenedStyles = StyleSheet.flatten((styleProp ?? {}) as ViewStyle);

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
