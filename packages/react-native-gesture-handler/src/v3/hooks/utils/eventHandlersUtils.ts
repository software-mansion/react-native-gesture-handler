import { TouchEventType } from '../../../TouchEventType';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import {
  BaseGestureConfig,
  ChangeCalculatorType,
  GestureCallbacks,
  GestureHandlerEvent,
} from '../../types';
import { isNativeEvent } from '../utils';

export function extractStateChangeHandlers(
  config: BaseGestureConfig<unknown>
): GestureCallbacks<unknown> {
  'worklet';
  const { onBegin, onStart, onEnd, onFinalize } = config;

  const handlers: GestureCallbacks<unknown> = {
    ...(onBegin ? { onBegin } : {}),
    ...(onStart ? { onStart } : {}),
    ...(onEnd ? { onEnd } : {}),
    ...(onFinalize ? { onFinalize } : {}),
  };

  return handlers;
}

type UpdateHandlersReturnType = {
  handlers: GestureCallbacks<unknown>;
  changeEventCalculator?: ChangeCalculatorType;
};

export function extractUpdateHandlers(
  config: BaseGestureConfig<unknown>
): UpdateHandlersReturnType {
  'worklet';
  const { onUpdate, changeEventCalculator } = config;

  const handlers: GestureCallbacks<unknown> = {
    ...(onUpdate ? { onUpdate } : {}),
  };

  return { handlers, changeEventCalculator };
}

export function extractTouchHandlers(
  config: BaseGestureConfig<unknown>
): GestureCallbacks<unknown> {
  const { onTouchesDown, onTouchesMove, onTouchesUp, onTouchesCancelled } =
    config;

  const handlers: GestureCallbacks<unknown> = {
    ...(onTouchesDown ? { onTouchesDown } : {}),
    ...(onTouchesMove ? { onTouchesMove } : {}),
    ...(onTouchesUp ? { onTouchesUp } : {}),
    ...(onTouchesCancelled ? { onTouchesCancelled } : {}),
  };

  return handlers;
}

export function getHandler(
  type: CALLBACK_TYPE,
  callbacks: GestureCallbacks<unknown>
) {
  'worklet';
  switch (type) {
    case CALLBACK_TYPE.BEGAN:
      return callbacks.onBegin;
    case CALLBACK_TYPE.START:
      return callbacks.onStart;
    case CALLBACK_TYPE.UPDATE:
      return callbacks.onUpdate;
    case CALLBACK_TYPE.END:
      return callbacks.onEnd;
    case CALLBACK_TYPE.FINALIZE:
      return callbacks.onFinalize;
    case CALLBACK_TYPE.TOUCHES_DOWN:
      return callbacks.onTouchesDown;
    case CALLBACK_TYPE.TOUCHES_MOVE:
      return callbacks.onTouchesMove;
    case CALLBACK_TYPE.TOUCHES_UP:
      return callbacks.onTouchesUp;
    case CALLBACK_TYPE.TOUCHES_CANCELLED:
      return callbacks.onTouchesCancelled;
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
  callbacks: GestureCallbacks<unknown>,
  event: GestureHandlerEvent<Record<string, unknown>>,
  ...args: unknown[]
) {
  'worklet';
  const handler = getHandler(type, callbacks);

  // TODO: add proper types (likely boolean)
  // @ts-ignore It works, duh
  handler?.(isNativeEvent(event) ? event.nativeEvent : event, ...args);
}
