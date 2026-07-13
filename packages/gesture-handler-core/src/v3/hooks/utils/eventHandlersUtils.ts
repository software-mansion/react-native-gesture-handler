import { useMemo } from 'react';

import { CALLBACK_TYPE } from '../../../CallbackType';
import { TouchEventType } from '../../../TouchEventType';
import type {
  GestureCallbacks,
  GestureEndEventCallback,
  GestureEventCallback,
  GestureTouchEventCallback,
  UnpackedGestureHandlerEvent,
} from '../../types';

export function useMemoizedGestureCallbacks<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  callbacks: GestureCallbacks<THandlerData, TExtendedHandlerData>
): GestureCallbacks<THandlerData, TExtendedHandlerData> {
  return useMemo(() => {
    const memoized: GestureCallbacks<THandlerData, TExtendedHandlerData> = {};

    if (callbacks.onBegin) {
      memoized.onBegin = callbacks.onBegin;
    }
    if (callbacks.onActivate) {
      memoized.onActivate = callbacks.onActivate;
    }
    if (callbacks.onDeactivate) {
      memoized.onDeactivate = callbacks.onDeactivate;
    }
    if (callbacks.onFinalize) {
      memoized.onFinalize = callbacks.onFinalize;
    }
    if (callbacks.onUpdate) {
      memoized.onUpdate = callbacks.onUpdate;
    }
    if (callbacks.onTouchesDown) {
      memoized.onTouchesDown = callbacks.onTouchesDown;
    }
    if (callbacks.onTouchesMove) {
      memoized.onTouchesMove = callbacks.onTouchesMove;
    }
    if (callbacks.onTouchesUp) {
      memoized.onTouchesUp = callbacks.onTouchesUp;
    }
    if (callbacks.onTouchesCancel) {
      memoized.onTouchesCancel = callbacks.onTouchesCancel;
    }

    return memoized;
  }, [
    callbacks.onActivate,
    callbacks.onBegin,
    callbacks.onDeactivate,
    callbacks.onFinalize,
    callbacks.onTouchesCancel,
    callbacks.onTouchesDown,
    callbacks.onTouchesMove,
    callbacks.onTouchesUp,
    callbacks.onUpdate,
  ]);
}

function getHandler<THandlerData, TExtendedHandlerData extends THandlerData>(
  type: CALLBACK_TYPE,
  callbacks: GestureCallbacks<THandlerData, TExtendedHandlerData>
):
  | GestureEventCallback<THandlerData>
  | GestureEventCallback<TExtendedHandlerData>
  | GestureEndEventCallback<THandlerData>
  | GestureEndEventCallback<TExtendedHandlerData>
  | GestureTouchEventCallback
  | undefined {
  'worklet';
  switch (type) {
    case CALLBACK_TYPE.BEGAN:
      return callbacks.onBegin;
    case CALLBACK_TYPE.START:
      return callbacks.onActivate;
    case CALLBACK_TYPE.UPDATE:
      return callbacks.onUpdate as GestureEventCallback<TExtendedHandlerData>; // Animated event is handled in different place.
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

export function runCallback<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  type: CALLBACK_TYPE,
  callbacks: GestureCallbacks<THandlerData, TExtendedHandlerData>,
  event: UnpackedGestureHandlerEvent<THandlerData>
) {
  'worklet';
  const handler = getHandler(type, callbacks);

  if (!handler) {
    return;
  }

  (handler as SingleParameterCallback<typeof event>)(event);
}
