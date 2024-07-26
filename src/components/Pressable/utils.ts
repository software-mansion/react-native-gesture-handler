import { Insets, ViewStyle } from 'react-native';
import { LongPressGestureHandlerEventPayload } from '../../handlers/GestureHandlerEventPayload';
import {
  TouchData,
  GestureStateChangeEvent,
  GestureTouchEvent,
} from '../../handlers/gestureHandlerCommon';
import { HoverGestureHandlerEventPayload } from '../../handlers/gestures/hoverGesture';
import { InnerPressableEvent, PressableEvent } from './PressableProps';

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
  event: GestureStateChangeEvent<
    HoverGestureHandlerEventPayload | LongPressGestureHandlerEventPayload
  >,
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
  dimensions: { width: number; height: number },
  inset: Insets,
  touch?: TouchData
) =>
  (touch?.x ?? 0) < (inset.right ?? 0) + dimensions.width &&
  (touch?.y ?? 0) < (inset.bottom ?? 0) + dimensions.height &&
  (touch?.x ?? 0) > -(inset.left ?? 0) &&
  (touch?.y ?? 0) > -(inset.top ?? 0);

const gestureToPressableEvent = (
  event: GestureStateChangeEvent<
    HoverGestureHandlerEventPayload | LongPressGestureHandlerEventPayload
  >
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

type StylePropKeys = (keyof ViewStyle)[];

// Source:
// - From ViewStyle extracted FlexStyle sub-interface which contains all of the box-model manipulating props.
// - From FlexStyle handpicked those styles, which act on the inner part of the box-model.
const innerStyleKeys = new Set([
  'alignContent',
  'alignItems',
  'flexBasis',
  'flexDirection',
  'flexWrap',
  'rowGap',
  'gap',
  'columnGap',
  'justifyContent',
  'overflow',
  'padding',
  'paddingBottom',
  'paddingEnd',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingTop',
  'paddingVertical',
  'start',
  'end',
  'direction', // iOS only
] as StylePropKeys);

const splitStyles = (from: ViewStyle): [ViewStyle, ViewStyle] => {
  const outerStyles: Record<string, unknown> = {};
  const innerStyles: Record<string, unknown> = {};

  for (const key in from) {
    if (innerStyleKeys.has(key as keyof ViewStyle)) {
      innerStyles[key] = from[key as keyof ViewStyle];
    } else {
      outerStyles[key] = from[key as keyof ViewStyle];
    }
  }

  return [innerStyles, outerStyles];
};

export {
  numberAsInset,
  addInsets,
  isTouchWithinInset,
  gestureToPressableEvent,
  gestureTouchToPressableEvent,
  splitStyles,
};
