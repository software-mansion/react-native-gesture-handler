import { useMemo } from 'react';
import { TouchEventType } from '../../../TouchEventType';
import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import {
  GestureCallbacks,
  GestureEventCallback,
  GestureEventCallbackWithDidSucceed,
  GestureTouchEventCallback,
  UnpackedGestureHandlerEvent,
} from '../../types';

export function useMemoizedGestureCallbacks<THandlerData>(
  callbacks: GestureCallbacks<THandlerData>
): GestureCallbacks<THandlerData> {
  return useMemo(
    () => ({
      ...(callbacks.onBegin ? { onBegin: callbacks.onBegin } : {}),
      ...(callbacks.onActivate ? { onActivate: callbacks.onActivate } : {}),
      ...(callbacks.onDeactivate
        ? { onDeactivate: callbacks.onDeactivate }
        : {}),
      ...(callbacks.onFinalize ? { onFinalize: callbacks.onFinalize } : {}),
      ...(callbacks.onUpdate ? { onUpdate: callbacks.onUpdate } : {}),
      ...(callbacks.onTouchesDown
        ? { onTouchesDown: callbacks.onTouchesDown }
        : {}),
      ...(callbacks.onTouchesMove
        ? { onTouchesMove: callbacks.onTouchesMove }
        : {}),
      ...(callbacks.onTouchesUp ? { onTouchesUp: callbacks.onTouchesUp } : {}),
      ...(callbacks.onTouchesCancel
        ? { onTouchesCancel: callbacks.onTouchesCancel }
        : {}),
    }),
    [
      callbacks.onActivate,
      callbacks.onBegin,
      callbacks.onDeactivate,
      callbacks.onFinalize,
      callbacks.onTouchesCancel,
      callbacks.onTouchesDown,
      callbacks.onTouchesMove,
      callbacks.onTouchesUp,
      callbacks.onUpdate,
    ]
  );
}

function getHandler<THandlerData>(
  type: CALLBACK_TYPE,
  callbacks: GestureCallbacks<THandlerData>
):
  | GestureEventCallback<THandlerData>
  | GestureEventCallbackWithDidSucceed<THandlerData>
  | GestureTouchEventCallback
  | undefined {
  'worklet';
  switch (type) {
    case CALLBACK_TYPE.BEGAN:
      return callbacks.onBegin;
    case CALLBACK_TYPE.START:
      return callbacks.onActivate;
    case CALLBACK_TYPE.UPDATE:
      return callbacks.onUpdate as GestureEventCallback<THandlerData>; // Animated event is handled in different place.
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

type SingleParameterCallback<T> = (event: T) => void;
type DoubleParameterCallback<T> = (event: T, didSucceed: boolean) => void;

export function runCallback<THandlerData>(
  type: CALLBACK_TYPE,
  callbacks: GestureCallbacks<THandlerData>,
  event: UnpackedGestureHandlerEvent<THandlerData>,
  didSucceed?: boolean
) {
  'worklet';
  const handler = getHandler(type, callbacks);

  if (!handler) {
    return;
  }

  if (didSucceed === undefined) {
    (handler as SingleParameterCallback<typeof event>)(event);
  } else {
    (handler as DoubleParameterCallback<typeof event>)(event, didSucceed);
  }
}
