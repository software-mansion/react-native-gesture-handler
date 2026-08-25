import { useMemo } from 'react';

import { CallbackType } from '../../../CallbackType';
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
  type: CallbackType,
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
    case CallbackType.BEGAN:
      return callbacks.onBegin;
    case CallbackType.START:
      return callbacks.onActivate;
    case CallbackType.UPDATE:
      return callbacks.onUpdate as GestureEventCallback<TExtendedHandlerData>; // Animated event is handled in different place.
    case CallbackType.END:
      return callbacks.onDeactivate;
    case CallbackType.FINALIZE:
      return callbacks.onFinalize;
    case CallbackType.TOUCHES_DOWN:
      return callbacks.onTouchesDown;
    case CallbackType.TOUCHES_MOVE:
      return callbacks.onTouchesMove;
    case CallbackType.TOUCHES_UP:
      return callbacks.onTouchesUp;
    case CallbackType.TOUCHES_CANCEL:
      return callbacks.onTouchesCancel;
  }
}

export function touchEventTypeToCallbackType(
  eventType: TouchEventType
): CallbackType {
  'worklet';
  switch (eventType) {
    case TouchEventType.TOUCHES_DOWN:
      return CallbackType.TOUCHES_DOWN;
    case TouchEventType.TOUCHES_MOVE:
      return CallbackType.TOUCHES_MOVE;
    case TouchEventType.TOUCHES_UP:
      return CallbackType.TOUCHES_UP;
    case TouchEventType.TOUCHES_CANCEL:
      return CallbackType.TOUCHES_CANCEL;
  }
  return CallbackType.UNDEFINED;
}

type SingleParameterCallback<T> = (event: T) => void;

export function runCallback<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  type: CallbackType,
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
