import {
  CALLBACK_TYPE,
  HandlerCallbacks,
} from '../../handlers/gestures/gesture';
import { TouchEventType } from '../../TouchEventType';
import { GestureHandlerEvent } from '../interfaces';

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

export function runWorklet(
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
