import { TouchEventType } from '../../../TouchEventType';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import {
  CallbackHandlers,
  GestureHandlerEvent,
  UpdateEvent,
} from '../../types';
import { isNativeEvent } from '../utils';

export function extractStateChangeHandlers(config: any): CallbackHandlers {
  'worklet';
  const { onBegin, onStart, onEnd, onFinalize } = config;

  const handlers: CallbackHandlers = {
    ...(onBegin ? { onBegin } : {}),
    ...(onStart ? { onStart } : {}),
    ...(onEnd ? { onEnd } : {}),
    ...(onFinalize ? { onFinalize } : {}),
  };

  return handlers;
}

export function extractUpdateHandlers(config: any): {
  handlers: CallbackHandlers;
  changeEventCalculator?: (
    current: UpdateEvent<Record<string, unknown>>,
    previous?: UpdateEvent<Record<string, unknown>>
  ) => UpdateEvent<Record<string, unknown>>;
} {
  'worklet';
  const { onUpdate, changeEventCalculator } = config;

  const handlers: CallbackHandlers = { ...(onUpdate ? { onUpdate } : {}) };

  return { handlers, changeEventCalculator };
}

export function extractTouchHandlers(config: any): CallbackHandlers {
  const { onTouchesDown, onTouchesMove, onTouchesUp, onTouchesCancelled } =
    config;

  const handlers: CallbackHandlers = {
    ...(onTouchesDown ? { onTouchesDown } : {}),
    ...(onTouchesMove ? { onTouchesMove } : {}),
    ...(onTouchesUp ? { onTouchesUp } : {}),
    ...(onTouchesCancelled ? { onTouchesCancelled } : {}),
  };

  return handlers;
}

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

export function runCallback(
  type: CALLBACK_TYPE,
  config: CallbackHandlers,
  event: GestureHandlerEvent<Record<string, unknown>>,
  ...args: unknown[]
) {
  'worklet';
  const handler = getHandler(type, config);

  // TODO: add proper types (likely boolean)
  // @ts-ignore It works, duh
  handler?.(isNativeEvent(event) ? event.nativeEvent : event, ...args);
}
