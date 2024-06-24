import React, { useRef, useState } from 'react';
import { GestureObjects as Gesture } from '../../handlers/gestures/gestureObjects';
import { GestureDetector } from '../../handlers/gestures/GestureDetector';
import { PressableProps } from './PressableProps';
import { Insets, StyleProp, View, ViewStyle, processColor } from 'react-native';
import RNButton from '../GestureHandlerButton';
import {
  numberAsInset,
  adaptStateChangeEvent,
  isTouchWithinInset,
  adaptTouchEvent,
  addInsets,
} from './utils';

const DEFAULT_LONG_PRESS_DURATION = 500;
const DEFAULT_HOVER_DELAY = 0;

export default function Pressable(props: PressableProps) {
  const initialPressedState = props.testOnly_pressed ?? false;

  const pressableRef = useRef<View>(null);
  const [styleProp, setStyleProp] = useState<StyleProp<ViewStyle> | undefined>(
    typeof props.style === 'function'
      ? props.style({ pressed: initialPressedState })
      : props.style
  );
  const [childrenProp, setChildrenProp] = useState<React.ReactNode | undefined>(
    typeof props.children === 'function'
      ? props.children({ pressed: initialPressedState })
      : props.children
  );

  const setPressedState = (isPressed: boolean) => {
    isPressedDown.current = isPressed;
    if (typeof props.style === 'function') {
      setStyleProp(props.style({ pressed: isPressed }));
    } else {
      setStyleProp(props.style);
    }
    if (typeof props.children === 'function') {
      setChildrenProp(props.children({ pressed: isPressed }));
    } else {
      setChildrenProp(props.children);
    }
  };

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

  const pressGesture = Gesture.LongPress().onStart((event) => {
    if (isPressedDown.current) {
      props.onLongPress?.(adaptStateChangeEvent(event));
      isPressCallbackEnabled.current = false;
    }
  });

  const hoverGesture = Gesture.Hover()
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
    });

  const touchGesture = Gesture.Manual()
    .onTouchesDown((event) => {
      pressableRef.current?.measure((_x, _y, width, height) => {
        if (
          !isTouchWithinInset(event.changedTouches.at(-1), normalizedHitSlop, {
            width,
            height,
          }) ||
          isPressedDown.current
        ) {
          return;
        }

        props.onPressIn?.(adaptTouchEvent(event));

        isPressCallbackEnabled.current = true;
        setPressedState(true);
      });
    })
    .onTouchesUp((event) => {
      if (
        !isPressedDown.current ||
        event.allTouches.length > event.changedTouches.length
      ) {
        return;
      }

      props.onPressOut?.(adaptTouchEvent(event));

      if (isPressCallbackEnabled.current) {
        props.onPress?.(adaptTouchEvent(event));
      }

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

      setPressedState(false);
    });

  const rippleGesture = Gesture.Native();

  pressGesture.minDuration(props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION);

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
        testID={props.testID}
        enabled={isPressableEnabled}
        ref={pressableRef}
        rippleColor={processColor(
          props.android_ripple?.color ?? defaultRippleColor
        )}
        rippleRadius={props.android_ripple?.radius ?? undefined}
        style={styleProp}>
        {childrenProp}
      </RNButton>
    </GestureDetector>
  );
}
