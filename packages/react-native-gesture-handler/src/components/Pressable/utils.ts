import type { Insets } from 'react-native';

import type {
  GestureStateChangeEvent,
  GestureTouchEvent,
  TouchData,
} from '../../handlers/gestureHandlerCommon';
import type {
  HoverGestureHandlerEventPayload,
  LongPressGestureHandlerEventPayload,
} from '../../handlers/GestureHandlerEventPayload';
import type { HoverGestureEvent, LongPressGestureEvent } from '../../v3';
import type { HoverGestureActiveEvent } from '../../v3/hooks';
import type {
  InnerPressableEvent,
  PressableDimensions,
  PressableEvent,
  PressableProps,
} from './PressableProps';

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

const viewCenterToPressableEvent = (
  dimensions: PressableDimensions
): PressableEvent => {
  const timestamp = Date.now();
  const targetId = 0;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const pressEvent: InnerPressableEvent = {
    identifier: 0,
    locationX: centerX,
    locationY: centerY,
    pageX: -1,
    pageY: -1,
    target: targetId,
    timestamp,
    touches: [],
    changedTouches: [],
  };

  return {
    nativeEvent: {
      touches: [pressEvent],
      changedTouches: [pressEvent],
      identifier: 0,
      locationX: centerX,
      locationY: centerY,
      pageX: -1,
      pageY: -1,
      target: targetId,
      timestamp,
      force: undefined,
    },
  };
};

const makeSyntheticPressableEvent = (
  dimensions: PressableDimensions,
  timestamp: number = Date.now(),
  targetId: number = 0
): PressableEvent => {
  const locationX = dimensions.width / 2;
  const locationY = dimensions.height / 2;
  // AccessibilityActionEvent does not expose native touch coordinates. Use the
  // center of the last layout as a layout-local synthetic point.
  const pageX = (dimensions.x ?? 0) + locationX;
  const pageY = (dimensions.y ?? 0) + locationY;
  const pressEvent: InnerPressableEvent = {
    identifier: 0,
    locationX,
    locationY,
    pageX,
    pageY,
    target: targetId,
    timestamp,
    touches: [],
    changedTouches: [],
    force: undefined,
  };

  return {
    nativeEvent: {
      touches: [pressEvent],
      changedTouches: [pressEvent],
      identifier: pressEvent.identifier,
      locationX,
      locationY,
      pageX,
      pageY,
      target: targetId,
      timestamp,
      force: undefined,
    },
  };
};

const getPressableAccessibilityActions = (
  accessibilityActions: PressableProps['accessibilityActions'],
  onPress: PressableProps['onPress'],
  onLongPress: PressableProps['onLongPress']
) => {
  const defaultActions = [
    ...(onPress ? [{ name: 'activate' }] : []),
    ...(onLongPress ? [{ name: 'longpress' }] : []),
  ];

  if (defaultActions.length === 0) {
    return accessibilityActions;
  }

  const actionNames = new Set(
    (accessibilityActions ?? []).map((action) => action.name)
  );

  return [
    ...(accessibilityActions ?? []),
    ...defaultActions.filter((action) => !actionNames.has(action.name)),
  ];
};

const isUserHandledAccessibilityAction = (
  actionName: string,
  accessibilityActions: PressableProps['accessibilityActions'],
  onAccessibilityAction: PressableProps['onAccessibilityAction']
) =>
  onAccessibilityAction != null &&
  (accessibilityActions ?? []).some((action) => action.name === actionName);

export {
  addInsets,
  gestureToPressableEvent,
  gestureTouchToPressableEvent,
  getPressableAccessibilityActions,
  isTouchWithinInset,
  isUserHandledAccessibilityAction,
  makeSyntheticPressableEvent,
  numberAsInset,
  viewCenterToPressableEvent,
};
