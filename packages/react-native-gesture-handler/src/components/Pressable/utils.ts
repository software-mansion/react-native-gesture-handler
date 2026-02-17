import { Insets } from 'react-native';
import {
  HoverGestureHandlerEventPayload,
  LongPressGestureHandlerEventPayload,
} from '../../handlers/GestureHandlerEventPayload';
import {
  TouchData,
  GestureStateChangeEvent,
  GestureTouchEvent,
} from '../../handlers/gestureHandlerCommon';
import {
  PressableDimensions,
  InnerPressableEvent,
  PressableEvent,
} from './PressableProps';
import { HoverGestureEvent, LongPressGestureEvent } from '../../v3';
import { HoverGestureActiveEvent } from '../../v3/hooks';

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

const touchDataToPressEvent = (
  data: TouchData,
  timestamp: number,
  targetId: number
): InnerPressableEvent => ({
  identifier: data.id,
  locationX: data.x,
  locationY: data.y,
  pageX: data.absoluteX,
  pageY: data.absoluteY,
  target: targetId,
  timestamp: timestamp,
  touches: [], // Always empty - legacy compatibility
  changedTouches: [], // Always empty - legacy compatibility
});

const gestureToPressEvent = (
  event:
    | GestureStateChangeEvent<
        HoverGestureHandlerEventPayload | LongPressGestureHandlerEventPayload
      >
    | HoverGestureEvent
    | HoverGestureActiveEvent
    | LongPressGestureEvent,
  timestamp: number,
  targetId: number
): InnerPressableEvent => ({
  identifier: event.handlerTag,
  locationX: event.x,
  locationY: event.y,
  pageX: event.absoluteX,
  pageY: event.absoluteY,
  target: targetId,
  timestamp: timestamp,
  touches: [], // Always empty - legacy compatibility
  changedTouches: [], // Always empty - legacy compatibility
});

const isTouchWithinInset = (
  dimensions: PressableDimensions,
  inset: Insets,
  touch?: InnerPressableEvent
) =>
  (touch?.locationX ?? 0) < (inset.right ?? 0) + dimensions.width &&
  (touch?.locationY ?? 0) < (inset.bottom ?? 0) + dimensions.height &&
  (touch?.locationX ?? 0) > -(inset.left ?? 0) &&
  (touch?.locationY ?? 0) > -(inset.top ?? 0);

const gestureToPressableEvent = (
  event:
    | GestureStateChangeEvent<
        HoverGestureHandlerEventPayload | LongPressGestureHandlerEventPayload
      >
    | HoverGestureEvent
    | HoverGestureActiveEvent
    | LongPressGestureEvent
): PressableEvent => {
  const timestamp = Date.now();

  // As far as I can see, there isn't a conventional way of getting targetId with the data we get
  const targetId = 0;

  const pressEvent = gestureToPressEvent(event, timestamp, targetId);

  return {
    nativeEvent: {
      touches: [pressEvent],
      changedTouches: [pressEvent],
      identifier: pressEvent.identifier,
      locationX: event.x,
      locationY: event.y,
      pageX: event.absoluteX,
      pageY: event.absoluteY,
      target: targetId,
      timestamp: timestamp,
      force: undefined,
    },
  };
};

const gestureTouchToPressableEvent = (
  event: GestureTouchEvent
): PressableEvent => {
  const timestamp = Date.now();

  // As far as I can see, there isn't a conventional way of getting targetId with the data we get
  const targetId = 0;

  const touchesList = event.allTouches.map((touch: TouchData) =>
    touchDataToPressEvent(touch, timestamp, targetId)
  );
  const changedTouchesList = event.changedTouches.map((touch: TouchData) =>
    touchDataToPressEvent(touch, timestamp, targetId)
  );

  return {
    nativeEvent: {
      touches: touchesList,
      changedTouches: changedTouchesList,
      identifier: event.handlerTag,
      locationX: event.allTouches.at(0)?.x ?? -1,
      locationY: event.allTouches.at(0)?.y ?? -1,
      pageX: event.allTouches.at(0)?.absoluteX ?? -1,
      pageY: event.allTouches.at(0)?.absoluteY ?? -1,
      target: targetId,
      timestamp: timestamp,
      force: undefined,
    },
  };
};

export {
  numberAsInset,
  addInsets,
  isTouchWithinInset,
  gestureToPressableEvent,
  gestureTouchToPressableEvent,
};
