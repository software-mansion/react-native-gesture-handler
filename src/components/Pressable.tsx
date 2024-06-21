import React, { useEffect, useRef, useState } from 'react';
import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';
import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  TouchData,
} from '../handlers/gestureHandlerCommon';
import { PressEvent, PressableEvent, PressableProps } from './PressableProps';
import { HoverGestureHandlerEventPayload } from '../handlers/gestures/hoverGesture';
import { LongPressGestureHandlerEventPayload } from '../handlers/LongPressGestureHandler';
import { Insets, StyleProp, View, ViewStyle } from 'react-native';
import { RectButton } from './GestureButtons';

const DEFAULT_LONG_PRESS_DURATION = 500;
const DEFAULT_HOVER_DELAY = 0;

const numberAsInset = (value: number): Insets => ({
  left: value,
  right: value,
  top: value,
  bottom: value,
});

const addInsets = (a: Insets, b: Insets): Insets => ({
  left: (a.left ?? 0) + (b.left ?? 0),
  right: (a.right ?? 0) + (b.right ?? 0),
  top: (a.top ?? 0) + (b.top ?? 0),
  bottom: (a.bottom ?? 0) + (b.bottom ?? 0),
});

const touchToPressEvent = (data: TouchData, timestamp: number): PressEvent => ({
  identifier: data.id,
  locationX: data.x,
  locationY: data.y,
  pageX: data.absoluteX,
  pageY: data.absoluteY,
  target: 0, // fixme if possible, set to correct target ID
  timestamp: timestamp,
  touches: [], // intentionally empty
  changedTouches: [], // intentionally empty
});

const changeToTouchData = (
  event: GestureStateChangeEvent<
    HoverGestureHandlerEventPayload | LongPressGestureHandlerEventPayload
  >
): TouchData => ({
  id: 0, // fixme if possible, set to correct pointer ID
  x: event.x,
  y: event.y,
  absoluteX: event.absoluteX,
  absoluteY: event.absoluteY,
});

const isTouchWithinInset = (
  // all of these are guaranteed to be their type,
  // but we cannot use '!' anymore
  touch?: TouchData,
  inset?: Insets,
  dimensions?: { width: number; height: number }
) =>
  // ^ to right, ^ to bottom
  (touch?.x ?? 0) < (inset?.right ?? 0) + (dimensions?.width ?? 0) &&
  (touch?.y ?? 0) < (inset?.bottom ?? 0) + (dimensions?.height ?? 0) &&
  (touch?.x ?? 0) > -(inset?.left ?? 0) &&
  (touch?.y ?? 0) > -(inset?.top ?? 0);

const adaptStateChangeEvent = (
  event: GestureStateChangeEvent<
    HoverGestureHandlerEventPayload | LongPressGestureHandlerEventPayload
  >
): PressableEvent => {
  const timestamp = Date.now();

  const touchData = changeToTouchData(event);

  const pressEvent = touchToPressEvent(touchData, timestamp);

  return {
    nativeEvent: {
      touches: [pressEvent],
      changedTouches: [pressEvent],
      identifier: event.handlerTag,
      locationX: event.x ?? -1,
      locationY: event.y ?? -1,
      pageX: event.absoluteX ?? -1,
      pageY: event.absoluteY ?? -1,
      target: 0, // node ID
      timestamp: timestamp,
      force: undefined,
    },
  };
};

const adaptTouchEvent = (event: GestureTouchEvent): PressableEvent => {
  const timestamp = Date.now();

  const nativeTouches = event.allTouches.map((touch) =>
    touchToPressEvent(touch, timestamp)
  );
  const nativeChangedTouches = event.changedTouches.map((touch) =>
    touchToPressEvent(touch, timestamp)
  );

  return {
    nativeEvent: {
      touches: nativeTouches,
      changedTouches: nativeChangedTouches,
      identifier: event.handlerTag,
      locationX: event.allTouches.at(0)?.x ?? -1,
      locationY: event.allTouches.at(0)?.y ?? -1,
      pageX: event.allTouches.at(0)?.absoluteX ?? -1,
      pageY: event.allTouches.at(0)?.absoluteY ?? -1,
      target: 0, // node ID
      timestamp: timestamp,
      force: undefined,
    },
  };
};

export default function Pressable(props: PressableProps) {
  const pressableRef = useRef<View>(null);
  const [styleProp, setStyleProp] = useState<
    StyleProp<ViewStyle> | undefined
  >();
  const [childrenProp, setChildrenProp] = useState<
    React.ReactNode | undefined
  >();

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
    props.onLongPress?.(adaptStateChangeEvent(event));
    isPressCallbackEnabled.current = false;
  });

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

  pressGesture.minDuration(props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION);

  const appliedHitSlop = addInsets(
    normalizedHitSlop,
    normalizedPressRetentionOffset
  );

  // this hitSlop block is required by android
  touchGesture.hitSlop(appliedHitSlop);
  pressGesture.hitSlop(appliedHitSlop);
  hoverGesture.hitSlop(appliedHitSlop);

  touchGesture.shouldCancelWhenOutside(true);
  pressGesture.shouldCancelWhenOutside(true);
  hoverGesture.shouldCancelWhenOutside(true);

  touchGesture.enabled(props.disabled !== true);
  pressGesture.enabled(props.disabled !== true);
  hoverGesture.enabled(props.disabled !== true);

  touchGesture.runOnJS(true);
  pressGesture.runOnJS(true);
  hoverGesture.runOnJS(true);

  const gesture = Gesture.Simultaneous(
    hoverGesture,
    pressGesture,
    touchGesture
  );

  useEffect(() => {
    setPressedState(false);
  }, []);

  return (
    <GestureDetector gesture={gesture}>
      <RectButton
        ref={pressableRef}
        // this hitSlop block is required by ios
        hitSlop={appliedHitSlop}
        rippleColor={props.android_ripple?.color ?? undefined}
        rippleRadius={props.android_ripple?.radius ?? undefined}
        style={styleProp}>
        {childrenProp}
      </RectButton>
    </GestureDetector>
  );
}
