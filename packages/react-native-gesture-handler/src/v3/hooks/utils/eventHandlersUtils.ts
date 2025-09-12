import { TouchEventType } from '../../../TouchEventType';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import {
  BaseGestureConfig,
  ChangeCalculatorType,
  GestureCallbacks,
  GestureHandlerEvent,
} from '../../types';
import { isNativeEvent } from '../utils';

export function extractStateChangeHandlers<THandlerData, TConfig>(
  config: BaseGestureConfig<THandlerData, TConfig>
): GestureCallbacks<THandlerData> {
  'worklet';
  const { onBegin, onStart, onEnd, onFinalize } = config;

  const handlers: GestureCallbacks<THandlerData> = {
    ...(onBegin ? { onBegin } : {}),
    ...(onStart ? { onStart } : {}),
    ...(onEnd ? { onEnd } : {}),
    ...(onFinalize ? { onFinalize } : {}),
  };

  return handlers;
}

type UpdateHandlersReturnType<THandlerData> = {
  handlers: GestureCallbacks<THandlerData>;
  changeEventCalculator?: ChangeCalculatorType<THandlerData>;
};

export function extractUpdateHandlers<THandlerData, TConfig>(
  config: BaseGestureConfig<THandlerData, TConfig>
): UpdateHandlersReturnType<THandlerData> {
  'worklet';
  const { onUpdate, changeEventCalculator } = config;

  const handlers: GestureCallbacks<THandlerData> = {
    ...(onUpdate ? { onUpdate } : {}),
  };

  return { handlers, changeEventCalculator };
}

export function extractTouchHandlers<THandlerData, TConfig>(
  config: BaseGestureConfig<THandlerData, TConfig>
): GestureCallbacks<THandlerData> {
  const { onTouchesDown, onTouchesMove, onTouchesUp, onTouchesCancelled } =
    config;

  const handlers: GestureCallbacks<THandlerData> = {
    ...(onTouchesDown ? { onTouchesDown } : {}),
    ...(onTouchesMove ? { onTouchesMove } : {}),
    ...(onTouchesUp ? { onTouchesUp } : {}),
    ...(onTouchesCancelled ? { onTouchesCancelled } : {}),
  };

  return handlers;
}

export function getHandler<THandlerData>(
  type: CALLBACK_TYPE,
  callbacks: GestureCallbacks<THandlerData>
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

export function runCallback<THandlerData>(
  type: CALLBACK_TYPE,
  callbacks: GestureCallbacks<THandlerData>,
  event: GestureHandlerEvent<THandlerData>,
  ...args: unknown[]
) {
  'worklet';
  const handler = getHandler(type, callbacks);

  // TODO: add proper types (likely boolean)
  // @ts-ignore It works, duh
  handler?.(isNativeEvent(event) ? event.nativeEvent : event, ...args);
}
