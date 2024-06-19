import React, { Component, useRef } from 'react';
import {
  View,
  StyleSheet,
  NativeMethods,
  GestureResponderEvent,
  NativeTouchEvent,
} from 'react-native';
import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';
import { GestureTouchEvent, TouchData } from '../handlers/gestureHandlerCommon';
import { PressableProps } from './PressableProps';
import { RectButton } from './GestureButtons';
import {
  GestureStateChangeEvent,
  LongPressGestureHandlerEventPayload,
} from '../../src';

const DEFAULT_LONG_PRESS_DURATION = 500;
const DEFAULT_HOVER_DELAY = 0;

const adaptPressEvent = (
  event: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>
): any => ({
  // return: GestureResponderEvent
  changedTouches: [], // not available, source from previous touches
  identifier: event.handlerTag,
  locationX: event.x,
  locationY: event.y,
  pageX: event.absoluteX,
  pageY: event.absoluteY,
  target: 'a' as unknown as Component<unknown> & NativeMethods, // ??? docs: string, lint: Component<unknown> & NativeMethods
  timestamp: 0,
  touches: event.numberOfPointers, // ??? docs: NativeTouchEvent[], lint: number
  force: undefined,
});

const adaptTouchEvent = (event: GestureTouchEvent): GestureResponderEvent => {
  const touchToNative = (data: TouchData): NativeTouchEvent => ({
    identifier: '',
    locationX: data.x,
    locationY: data.y,
    pageX: data.absoluteX,
    pageY: data.absoluteY,
    target: '',
    timestamp: 0,
    touches: [], // linter-required, not present in reality
    changedTouches: [], // linter-required, not present in reality
  });

  const nativeTouches = event.allTouches.map((touch) => touchToNative(touch));
  const nativeChangedTouches = event.changedTouches.map((touch) =>
    touchToNative(touch)
  );

  return {
    nativeEvent: {
      touches: nativeTouches, // NativeTouchEvent[]
      changedTouches: nativeChangedTouches, // change to: NativeTouchEvent[]
      identifier: event.handlerTag.toString(),
      locationX: event.allTouches.at(0)?.x ?? -1,
      locationY: event.allTouches.at(0)?.y ?? -1,
      pageX: event.allTouches.at(0)?.absoluteX ?? -1,
      pageY: event.allTouches.at(0)?.absoluteY ?? -1,
      target: 'a', // node ID
      timestamp: 0,
      force: undefined,
    },
    currentTarget: 0 as any,
    target: 0 as any,
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    preventDefault: () => null,
    isDefaultPrevented: () => false,
    stopPropagation: () => null,
    isPropagationStopped: () => false,
    persist: () => null,
    timeStamp: 0,
    type: '',
  };
};

export default function Pressable(props: PressableProps) {
  const previousTouchData = useRef<TouchData[] | null>(null);
  const previousChangeData = useRef<TouchData[] | null>(null);
  const pressableRef = useRef<View>(null);

  const pressGesture = Gesture.LongPress().onStart((event) => {
    props.onLongPress?.(adaptPressEvent(event));
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

  const resetHitSlop = useRef<() => void>(() => null);
  const setHitSlop = useRef<() => void>(() => null);

  const touchGesture = Gesture.Native()
    .onTouchesDown((event) => {
      // check if all touching fingers were lifted up on the previous event
      if (
        !previousTouchData.current ||
        !previousChangeData.current ||
        previousTouchData.current?.length === previousChangeData.current?.length
      ) {
        props.onPressIn?.(adaptTouchEvent(event));
        setHitSlop.current();
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

      resetHitSlop.current();

      props.onPress?.(adaptTouchEvent(event));
      props.onPressOut?.(adaptTouchEvent(event));

      previousTouchData.current = event.allTouches;
      previousChangeData.current = event.changedTouches;
    })
    .onTouchesCancelled((event) => {
      // we cannot just set `event.allTouches` and `event.changedTouches` here,
      // as that could break `onTouchesDown` activation metric
      previousTouchData.current = [];
      previousChangeData.current = [];

      resetHitSlop.current();

      props.onPress?.(adaptTouchEvent(event));
      props.onPressOut?.(adaptTouchEvent(event));
    });

  pressGesture.minDuration(props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION);

  // todo: implement onBlur and onFocus, more details on how available in the PR

  resetHitSlop.current = () => {
    touchGesture.hitSlop(props.hitSlop);
    pressGesture.hitSlop(props.hitSlop);
    hoverGesture.hitSlop(props.hitSlop);
  };

  setHitSlop.current = () => {
    touchGesture.hitSlop(props.pressRetentionOffset);
    pressGesture.hitSlop(props.pressRetentionOffset);
    hoverGesture.hitSlop(props.pressRetentionOffset);
  };

  resetHitSlop.current();

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
