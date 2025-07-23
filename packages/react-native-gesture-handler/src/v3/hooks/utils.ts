import { NativeSyntheticEvent } from 'react-native';
import { CALLBACK_TYPE } from '../../handlers/gestures/gesture';
import { TouchEventType } from '../../TouchEventType';
import {
  CallbackHandlers,
  GestureHandlerEvent,
  GestureStateChangeEventWithData,
  GestureUpdateEventWithData,
} from '../types';
import { GestureTouchEvent } from '../../handlers/gestureHandlerCommon';

export function getHandler(type: CALLBACK_TYPE, config: CallbackHandlers) {
  'worklet';
  switch (type) {
    case CALLBACK_TYPE.BEGAN:
      return config.onBegin;
    case CALLBACK_TYPE.START:
      return config.onStart;
    case CALLBACK_TYPE.UPDATE:
      return config.onUpdate;
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
  config: CallbackHandlers,
  event: GestureHandlerEvent<Record<string, unknown>>,
  ...args: unknown[]
) {
  'worklet';
  const handler = getHandler(type, config);

  // TODO: add proper types (likely boolean)
  // @ts-ignore It works, duh
  handler?.(event, ...args);
}

export function isNativeEvent(
  event: GestureHandlerEvent<unknown>
): event is
  | NativeSyntheticEvent<GestureUpdateEventWithData<unknown>>
  | NativeSyntheticEvent<GestureStateChangeEventWithData<unknown>>
  | NativeSyntheticEvent<GestureTouchEvent> {
  'worklet';

  return 'nativeEvent' in event;
}

export function isEventForHandlerWithTag(
  handlerTag: number,
  event: GestureHandlerEvent<Record<string, unknown>>
) {
  'worklet';

  return isNativeEvent(event)
    ? event.nativeEvent.handlerTag === handlerTag
    : event.handlerTag === handlerTag;
}
