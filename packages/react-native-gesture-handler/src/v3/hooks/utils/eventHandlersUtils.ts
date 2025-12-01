import { TouchEventType } from '../../../TouchEventType';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import {
  ChangeCalculatorType,
  GestureCallbacks,
  UnpackedGestureHandlerEvent,
} from '../../types';

export function prepareStateChangeHandlers<THandlerData>(
  callbacks: GestureCallbacks<THandlerData>
): GestureCallbacks<THandlerData> {
  'worklet';
  const { onBegin, onActivate, onDeactivate, onFinalize } = callbacks;

  const handlers: GestureCallbacks<THandlerData> = {
    ...(onBegin ? { onBegin } : {}),
    ...(onActivate ? { onActivate } : {}),
    ...(onDeactivate ? { onDeactivate } : {}),
    ...(onFinalize ? { onFinalize } : {}),
  };

  return handlers;
}

type UpdateHandlersReturnType<THandlerData> = {
  handlers: GestureCallbacks<THandlerData>;
  changeEventCalculator?: ChangeCalculatorType<THandlerData>;
};

export function prepareUpdateHandlers<THandlerData>(
  callbacks: GestureCallbacks<THandlerData>,
  changeEventCalculator?: ChangeCalculatorType<THandlerData>
): UpdateHandlersReturnType<THandlerData> {
  'worklet';
  const { onUpdate } = callbacks;

  const handlers: GestureCallbacks<THandlerData> = {
    ...(onUpdate ? { onUpdate } : {}),
  };

  return { handlers, changeEventCalculator };
}

export function prepareTouchHandlers<THandlerData>(
  callbacks: GestureCallbacks<THandlerData>
): GestureCallbacks<THandlerData> {
  const { onTouchesDown, onTouchesMove, onTouchesUp, onTouchesCancel } =
    callbacks;

  const handlers: GestureCallbacks<THandlerData> = {
    ...(onTouchesDown ? { onTouchesDown } : {}),
    ...(onTouchesMove ? { onTouchesMove } : {}),
    ...(onTouchesUp ? { onTouchesUp } : {}),
    ...(onTouchesCancel ? { onTouchesCancel } : {}),
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
      return callbacks.onActivate;
    case CALLBACK_TYPE.UPDATE:
      return callbacks.onUpdate;
    case CALLBACK_TYPE.END:
      return callbacks.onDeactivate;
    case CALLBACK_TYPE.FINALIZE:
      return callbacks.onFinalize;
    case CALLBACK_TYPE.TOUCHES_DOWN:
      return callbacks.onTouchesDown;
    case CALLBACK_TYPE.TOUCHES_MOVE:
      return callbacks.onTouchesMove;
    case CALLBACK_TYPE.TOUCHES_UP:
      return callbacks.onTouchesUp;
    case CALLBACK_TYPE.TOUCHES_CANCEL:
      return callbacks.onTouchesCancel;
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
    case TouchEventType.TOUCHES_CANCEL:
      return CALLBACK_TYPE.TOUCHES_CANCEL;
  }
  return CALLBACK_TYPE.UNDEFINED;
}

export function runCallback<THandlerData>(
  type: CALLBACK_TYPE,
  callbacks: GestureCallbacks<THandlerData>,
  event: UnpackedGestureHandlerEvent<THandlerData>,
  ...args: unknown[]
) {
  'worklet';
  const handler = getHandler(type, callbacks);

  // TODO: add proper types (likely boolean)
  // @ts-ignore It works, duh
  handler?.(event, ...args);
}
