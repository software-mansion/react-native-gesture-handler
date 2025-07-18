import { NativeSyntheticEvent } from 'react-native';
import {
  CALLBACK_TYPE,
  HandlerCallbacks,
} from '../../handlers/gestures/gesture';
import { TouchEventType } from '../../TouchEventType';
import { GestureHandlerEvent } from '../types';
import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
} from '../../handlers/gestureHandlerCommon';

export function getHandler(
  type: CALLBACK_TYPE,
  config: HandlerCallbacks<Record<string, unknown>>
) {
  'worklet';
  switch (type) {
    case CALLBACK_TYPE.BEGAN:
      return config.onBegin;
    case CALLBACK_TYPE.START:
      return config.onStart;
    case CALLBACK_TYPE.UPDATE:
      return config.onUpdate;
    case CALLBACK_TYPE.CHANGE:
      return config.onChange;
    case CALLBACK_TYPE.END:
      return config.onEnd;
    case CALLBACK_TYPE.FINALIZE:
      return config.onFinalize;
    case CALLBACK_TYPE.TOUCHES_DOWN:
      return config.onTouchesDown;
    case CALLBACK_TYPE.TOUCHES_MOVE:
      return config.onTouchesMove;
    case CALLBACK_TYPE.TOUCHES_UP:
      return config.onTouchesUp;
    case CALLBACK_TYPE.TOUCHES_CANCELLED:
      return config.onTouchesCancelled;
  }
}

export function touchEventTypeToCallbackType(
  eventType: TouchEventType
): CALLBACK_TYPE {
  'worklet';
  switch (eventType) {
    case TouchEventType.TOUCHES_DOWN:
      return CALLBACK_TYPE.TOUCHES_DOWN;
    case TouchEventType.TOUCHES_MOVE:
      return CALLBACK_TYPE.TOUCHES_MOVE;
    case TouchEventType.TOUCHES_UP:
      return CALLBACK_TYPE.TOUCHES_UP;
    case TouchEventType.TOUCHES_CANCELLED:
      return CALLBACK_TYPE.TOUCHES_CANCELLED;
  }
  return CALLBACK_TYPE.UNDEFINED;
}

export function runWorkletCallback(
  type: CALLBACK_TYPE,
  config: HandlerCallbacks<Record<string, unknown>>,
  event: GestureHandlerEvent,
  ...args: unknown[]
) {
  'worklet';
  const handler = getHandler(type, config);

  // @ts-ignore It works, duh -_-
  handler?.(event, ...args);
}

function isNativeEvent(
  event:
    | GestureHandlerEvent
    | NativeSyntheticEvent<
        GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
      >
): event is NativeSyntheticEvent<
  GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
> {
  'worklet';

  return 'nativeEvent' in event;
}

export function compareTags(handlerTag: number, event: GestureHandlerEvent) {
  'worklet';

  return isNativeEvent(event)
    ? event.nativeEvent.handlerTag === handlerTag
    : event.handlerTag === handlerTag;
}
