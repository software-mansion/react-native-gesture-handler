import { Insets } from 'react-native';
import { LongPressGestureHandlerEventPayload } from 'src/handlers/LongPressGestureHandler';
import {
  TouchData,
  GestureStateChangeEvent,
  GestureTouchEvent,
} from 'src/handlers/gestureHandlerCommon';
import { HoverGestureHandlerEventPayload } from 'src/handlers/gestures/hoverGesture';
import { PressEvent, PressableEvent } from './PressableProps';

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
  touch?: TouchData,
  inset?: Insets,
  dimensions?: { width: number; height: number }
) =>
  touch!.x < inset!.right! + dimensions!.width! &&
  touch!.y < inset!.bottom! + dimensions!.height! &&
  touch!.x > -inset!.left! &&
  touch!.y > -inset!.top!;

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
      locationX: event.x!,
      locationY: event.y!,
      pageX: event.absoluteX!,
      pageY: event.absoluteY!,
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
      locationX: event.allTouches.at(0)?.x!,
      locationY: event.allTouches.at(0)?.y!,
      pageX: event.allTouches.at(0)?.absoluteX!,
      pageY: event.allTouches.at(0)?.absoluteY!,
      target: 0, // node ID
      timestamp: timestamp,
      force: undefined,
    },
  };
};

export {
  numberAsInset,
  addInsets,
  touchToPressEvent,
  changeToTouchData,
  isTouchWithinInset,
  adaptStateChangeEvent,
  adaptTouchEvent,
};
