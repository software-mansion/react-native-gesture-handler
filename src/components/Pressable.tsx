import React, { useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';
import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  TouchData,
} from '../handlers/gestureHandlerCommon';
import { PressEvent, PressableEvent, PressableProps } from './PressableProps';
import { RectButton } from './GestureButtons';
import { HoverGestureHandlerEventPayload } from '../handlers/gestures/hoverGesture';
import { LongPressGestureHandlerEventPayload } from '../handlers/LongPressGestureHandler';

const DEFAULT_LONG_PRESS_DURATION = 500;
const DEFAULT_HOVER_DELAY = 0;

const touchToPressEvent = (data: TouchData, timestamp: number): PressEvent => ({
  identifier: data.id,
  locationX: data.x,
  locationY: data.y,
  pageX: data.absoluteX,
  pageY: data.absoluteY,
  target: 0,
  timestamp: timestamp,
  touches: [], // intentionally empty
  changedTouches: [], // intentionally empty
});

const changeToTouchData = (
  event: GestureStateChangeEvent<
    HoverGestureHandlerEventPayload | LongPressGestureHandlerEventPayload
  >
): TouchData => ({
  id: 0,
  x: event.x,
  y: event.y,
  absoluteX: event.absoluteX,
  absoluteY: event.absoluteY,
});

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
  const previousTouchData = useRef<TouchData[] | null>(null);
  const previousChangeData = useRef<TouchData[] | null>(null);
  const pressableRef = useRef<View>(null);

  // disabled when onLongPress has been called
  const isPressEnabled = useRef<boolean>(true);

  const pressGesture = Gesture.LongPress().onStart((event) => {
    props.onLongPress?.(adaptStateChangeEvent(event));
    isPressEnabled.current = false;
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

  let setHitSlop: () => void = () => null;
  let setPressRetentionOffset: () => void = () => null;

  const touchGesture = Gesture.Manual()
    .onTouchesDown((event) => {
      setPressRetentionOffset();

      if (
        // check if all touching fingers were lifted up on the previous event
        !previousTouchData.current ||
        !previousChangeData.current ||
        previousTouchData.current?.length === previousChangeData.current?.length
      ) {
        props.onPressIn?.(adaptTouchEvent(event));
        isPressEnabled.current = true;
        previousTouchData.current = event.allTouches;
        previousChangeData.current = event.changedTouches;
      }
    })
    .onTouchesUp((event) => {
      // doesn't call onPressOut until last pointer leaves
      if (event.allTouches.length > event.changedTouches.length) {
        previousTouchData.current = event.allTouches;
        previousChangeData.current = event.changedTouches;
        return;
      }

      setHitSlop();

      props.onPressOut?.(adaptTouchEvent(event));

      if (isPressEnabled.current) {
        props.onPress?.(adaptTouchEvent(event));
      }

      previousTouchData.current = event.allTouches;
      previousChangeData.current = event.changedTouches;
    })
    .onTouchesCancelled((event) => {
      // we cannot just set `event.allTouches` and `event.changedTouches` here,
      // as that could break `onTouchesDown` activation metric
      previousTouchData.current = [];
      previousChangeData.current = [];

      setHitSlop();

      // original triggers onPressOut on cancel, but not onPress
      props.onPressOut?.(adaptTouchEvent(event));
    });

  pressGesture.minDuration(props.delayLongPress ?? DEFAULT_LONG_PRESS_DURATION);

  setHitSlop = useCallback(() => {
    touchGesture.hitSlop(props.hitSlop);
    pressGesture.hitSlop(props.hitSlop);
    hoverGesture.hitSlop(props.hitSlop);
  }, [touchGesture, pressGesture, hoverGesture]);

  setPressRetentionOffset = useCallback(() => {
    touchGesture.hitSlop(props.pressRetentionOffset);
    pressGesture.hitSlop(props.pressRetentionOffset);
    hoverGesture.hitSlop(props.pressRetentionOffset);
  }, [touchGesture, pressGesture, hoverGesture]);

  setHitSlop();

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

  return (
    <RectButton
      ref={pressableRef}
      hitSlop={props.hitSlop}
      rippleColor={props.android_ripple?.color}
      rippleRadius={props.android_ripple?.radius}>
      <GestureDetector gesture={gesture}>
        <View
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
