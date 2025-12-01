import { useMemo } from 'react';
import { TouchEventType } from '../../../TouchEventType';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { GestureCallbacks, UnpackedGestureHandlerEvent } from '../../types';

export function useMemoizedGestureCallbacks<THandlerData>(
  config: GestureCallbacks<THandlerData>
): GestureCallbacks<THandlerData> {
  return useMemo(
    () => ({
      ...(config.onBegin ? { onBegin: config.onBegin } : {}),
      ...(config.onActivate ? { onActivate: config.onActivate } : {}),
      ...(config.onDeactivate ? { onDeactivate: config.onDeactivate } : {}),
      ...(config.onFinalize ? { onFinalize: config.onFinalize } : {}),
      ...(config.onUpdate ? { onUpdate: config.onUpdate } : {}),
      ...(config.onTouchesDown ? { onTouchesDown: config.onTouchesDown } : {}),
      ...(config.onTouchesMove ? { onTouchesMove: config.onTouchesMove } : {}),
      ...(config.onTouchesUp ? { onTouchesUp: config.onTouchesUp } : {}),
      ...(config.onTouchesCancel
        ? { onTouchesCancel: config.onTouchesCancel }
        : {}),
    }),
    [
      config.onActivate,
      config.onBegin,
      config.onDeactivate,
      config.onFinalize,
      config.onTouchesCancel,
      config.onTouchesDown,
      config.onTouchesMove,
      config.onTouchesUp,
      config.onUpdate,
    ]
  );
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
