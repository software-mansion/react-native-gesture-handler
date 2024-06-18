import React, { Component, useRef } from 'react';
import { View, StyleSheet, NativeMethods } from 'react-native';
import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';
import { GestureTouchEvent, TouchData } from '../handlers/gestureHandlerCommon';
import { PressableProps } from './PressableProps';
import { RectButton } from './GestureButtons';

const DEFAULT_LONG_PRESS_DURATION = 500;
const DEFAULT_HOVER_DELAY = 0;

const adaptEvent = (event: GestureTouchEvent): any => ({
  // : GestureResponderEvent
  changedTouches: event.changedTouches, // change to: NativeTouchEvent[], this is actually a recursive structure :/
  identifier: event.handlerTag, // string,

  // get latest touch point
  locationX: event.allTouches.at(-1)?.x,
  locationY: event.allTouches.at(-1)?.y,
  pageX: event.allTouches.at(-1)?.absoluteX,
  pageY: event.allTouches.at(-1)?.absoluteY,
  target: 'a' as unknown as Component<unknown> & NativeMethods, // ??? string,
  timestamp: 0, // number,
  touches: 0, // NativeTouchEvent[],
  force: undefined, // number | undefined,
});

export default function Pressable(props: PressableProps) {
  const previousTouchData = useRef<TouchData[] | null>(null);
  const previousChangeData = useRef<TouchData[] | null>(null);
  const pressableRef = useRef<View>(null);

  const pressGesture = Gesture.LongPress().onStart((event) => {
    props.onLongPress?.(adaptEvent(event as any));
  });

  const hoverGesture = Gesture.Hover()
    .onBegin((event) => {
      setTimeout(
        () => props.onHoverIn?.(event),
        props.delayHoverIn ?? DEFAULT_HOVER_DELAY
      );
    })
    .onEnd((event) => {
      setTimeout(
        () => props.onHoverOut?.(event),
        props.delayHoverOut ?? DEFAULT_HOVER_DELAY
      );
    });

  const touchGesture = Gesture.Native()
    .onTouchesDown((event) => {
      // check if all touching fingers were lifted up on the previous event
      if (
        !previousTouchData.current ||
        !previousChangeData.current ||
        previousTouchData.current?.length === previousChangeData.current?.length
      ) {
        props.onPressIn?.(adaptEvent(event));
        touchGesture.hitSlop(props.pressRetentionOffset);
        previousTouchData.current = event.allTouches;
        previousChangeData.current = event.changedTouches;
      }
    })
    .onTouchesUp((event) => {
      // doesn't call onPressOut untill the last pointer leaves, while within bounds
      if (event.allTouches.length > event.changedTouches.length) {
        previousTouchData.current = event.allTouches;
        previousChangeData.current = event.changedTouches;
        return;
      }

      resetHitSlop();

      props.onPress?.(adaptEvent(event));
      props.onPressOut?.(adaptEvent(event));

      previousTouchData.current = event.allTouches;
      previousChangeData.current = event.changedTouches;
    })
    .onTouchesCancelled((event) => {
      // we cannot just set `event.allTouches` and `event.changedTouches` here,
      // as that could break `onTouchesDown` activation metric
      previousTouchData.current = [];
      previousChangeData.current = [];

      resetHitSlop();

      props.onPress?.(adaptEvent(event));
      props.onPressOut?.(adaptEvent(event));
    });

  pressGesture.minDuration(props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION);

  // todo: implement onBlur and onFocus, more details on how available in the PR

  const resetHitSlop = () => {
    touchGesture.hitSlop(props.hitSlop);
    pressGesture.hitSlop(props.hitSlop);
    hoverGesture.hitSlop(props.hitSlop);
  };

  resetHitSlop();

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

  return (
    <RectButton
      rippleColor={props.android_ripple?.color}
      rippleRadius={props.android_ripple?.radius}>
      <GestureDetector gesture={gesture}>
        <View
          ref={pressableRef}
          style={[
            styles.container,
            typeof props.style === 'function'
              ? props.style({ pressed: false })
              : props.style,
          ]}>
          {typeof props.children === 'function'
            ? props.children({ pressed: false })
            : props.children}
        </View>
      </GestureDetector>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 'auto',
    height: 'auto',
  },
});
