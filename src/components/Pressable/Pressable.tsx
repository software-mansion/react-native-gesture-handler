import React, { useCallback, useMemo, useRef, useState } from 'react';
import { GestureObjects as Gesture } from '../../handlers/gestures/gestureObjects';
import { GestureDetector } from '../../handlers/gestures/GestureDetector';
import { PressableProps } from './PressableProps';
import { Insets, View, processColor } from 'react-native';
import RNButton from '../GestureHandlerButton';
import {
  numberAsInset,
  adaptStateChangeEvent,
  isTouchWithinInset,
  adaptTouchEvent,
  addInsets,
} from './utils';
import { PressabilityDebugView } from '../../handlers/PressabilityDebugView';
import { GestureTouchEvent } from '../../handlers/gestureHandlerCommon';

const DEFAULT_LONG_PRESS_DURATION = 500;
const DEFAULT_HOVER_DELAY = 0;

export default function Pressable(props: PressableProps) {
  const [pressedState, setPressedState] = useState(
    props.testOnly_pressed ?? false
  );

  const styleProp =
    typeof props.style === 'function'
      ? props.style({ pressed: pressedState })
      : props.style;

  const childrenProp =
    typeof props.children === 'function'
      ? props.children({ pressed: pressedState })
      : props.children;

  const pressableRef = useRef<View>(null);

  // disabled when onLongPress has been called
  const isPressCallbackEnabled = useRef<boolean>(true);
  const isPressedDown = useRef<boolean>(false);

  const normalizedHitSlop: Insets =
    typeof props.hitSlop === 'number'
      ? numberAsInset(props.hitSlop)
      : props.hitSlop ?? {};

  const normalizedPressRetentionOffset: Insets =
    typeof props.pressRetentionOffset === 'number'
      ? numberAsInset(props.pressRetentionOffset)
      : props.pressRetentionOffset ?? {};

  const pressGesture = useMemo(
    () =>
      Gesture.LongPress().onStart((event) => {
        if (isPressedDown.current) {
          props.onLongPress?.(adaptStateChangeEvent(event));
          isPressCallbackEnabled.current = false;
        }
      }),
    [isPressCallbackEnabled, props.onLongPress, isPressedDown]
  );

  const hoverGesture = useMemo(
    () =>
      Gesture.Hover()
        .onBegin((event) => {
          setTimeout(
            () => props.onHoverIn?.(adaptStateChangeEvent(event)),
            props.delayHoverIn ?? DEFAULT_HOVER_DELAY
          );
        })
        .onEnd((event) => {
          setTimeout(
            () => props.onHoverOut?.(adaptStateChangeEvent(event)),
            props.delayHoverOut ?? DEFAULT_HOVER_DELAY
          );
        }),
    [props.onHoverIn, props.onHoverOut, props.delayHoverIn, props.delayHoverOut]
  );

  const pressDelayTimeoutRef = useRef<number | null>(null);
  const onPressInRoutine = useCallback((event: GestureTouchEvent) => {
    props.onPressIn?.(adaptTouchEvent(event));
    isPressCallbackEnabled.current = true;
    isPressedDown.current = true;
    setPressedState(true);
    pressDelayTimeoutRef.current = null;
  }, []);

  const touchGesture = useMemo(
    () =>
      Gesture.Manual()
        .onTouchesDown((event) => {
          pressableRef.current?.measure((_x, _y, width, height) => {
            if (
              !isTouchWithinInset(
                {
                  width,
                  height,
                },
                event.changedTouches.at(-1),
                normalizedHitSlop
              ) ||
              isPressedDown.current
            ) {
              return;
            }

            if (props.unstable_pressDelay) {
              pressDelayTimeoutRef.current = setTimeout(() => {
                onPressInRoutine(event);
              }, props.unstable_pressDelay);
            } else {
              onPressInRoutine(event);
            }
          });
        })
        .onTouchesUp((event) => {
          if (
            !isPressedDown.current ||
            event.allTouches.length > event.changedTouches.length
          ) {
            return;
          }

          if (
            props.unstable_pressDelay &&
            pressDelayTimeoutRef.current !== null
          ) {
            // if pressDelay is set, we want to call onPressIn on touch up
            clearTimeout(pressDelayTimeoutRef.current);
            onPressInRoutine(event);
          }

          props.onPressOut?.(adaptTouchEvent(event));

          if (isPressCallbackEnabled.current) {
            props.onPress?.(adaptTouchEvent(event));
          }

          isPressedDown.current = false;
          setPressedState(false);
        })
        .onTouchesCancelled((event) => {
          if (
            !isPressedDown.current ||
            event.allTouches.length > event.changedTouches.length
          ) {
            return;
          }

          // original triggers onPressOut on cancel, but not onPress
          props.onPressOut?.(adaptTouchEvent(event));

          isPressedDown.current = false;
          setPressedState(false);
        }),
    [
      props.onPress,
      props.onPressIn,
      props.onPressOut,
      setPressedState,
      isPressedDown,
      isPressCallbackEnabled,
      normalizedHitSlop,
      pressDelayTimeoutRef,
    ]
  );

  const rippleGesture = useMemo(() => Gesture.Native(), []);

  pressGesture.minDuration(
    (props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION) +
      (props.unstable_pressDelay ?? 0)
  );

  const appliedHitSlop = addInsets(
    normalizedHitSlop,
    normalizedPressRetentionOffset
  );

  // this hitSlop block is required by android
  touchGesture.hitSlop(appliedHitSlop);
  pressGesture.hitSlop(appliedHitSlop);
  hoverGesture.hitSlop(appliedHitSlop);
  rippleGesture.hitSlop(normalizedHitSlop);

  touchGesture.shouldCancelWhenOutside(true);
  pressGesture.shouldCancelWhenOutside(true);
  hoverGesture.shouldCancelWhenOutside(true);

  const isPressableEnabled = props.disabled !== true;

  touchGesture.enabled(isPressableEnabled);
  pressGesture.enabled(isPressableEnabled);
  hoverGesture.enabled(isPressableEnabled);

  touchGesture.runOnJS(true);
  pressGesture.runOnJS(true);
  hoverGesture.runOnJS(true);

  const gesture = Gesture.Simultaneous(
    hoverGesture,
    pressGesture,
    touchGesture,
    rippleGesture
  );

  const defaultRippleColor = props.android_ripple ? undefined : 'transparent';

  return (
    <GestureDetector gesture={gesture}>
      <RNButton
        ref={pressableRef}
        testID={props.testID}
        enabled={isPressableEnabled}
        touchSoundDisabled={props.android_disableSound ?? undefined}
        rippleColor={processColor(
          props.android_ripple?.color ?? defaultRippleColor
        )}
        rippleRadius={props.android_ripple?.radius ?? undefined}
        style={[{ cursor: 'pointer' }, styleProp]}>
        {childrenProp}
        {__DEV__ ? (
          <PressabilityDebugView color="red" hitSlop={normalizedHitSlop} />
        ) : null}
      </RNButton>
    </GestureDetector>
  );
}
