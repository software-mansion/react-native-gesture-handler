import { Animated, NativeSyntheticEvent } from 'react-native';
import { CALLBACK_TYPE } from '../../handlers/gestures/gesture';
import { TouchEventType } from '../../TouchEventType';
import {
  AnimatedEvent,
  CallbackHandlers,
  GestureHandlerEvent,
  GestureStateChangeEventWithData,
  GestureUpdateEventWithData,
  UpdateEvent,
  NativeGesture,
  ComposedGesture,
} from '../types';
import { GestureTouchEvent } from '../../handlers/gestureHandlerCommon';
import { tagMessage } from '../../utils';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';

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
export function isNativeEvent(
  event: GestureHandlerEvent<unknown>
): event is
  | NativeSyntheticEvent<GestureUpdateEventWithData<unknown>>
  | NativeSyntheticEvent<GestureStateChangeEventWithData<unknown>>
  | NativeSyntheticEvent<GestureTouchEvent> {
  'worklet';

  return 'nativeEvent' in event;
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

export function isEventForHandlerWithTag(
  handlerTag: number,
  event: GestureHandlerEvent<Record<string, unknown>>
) {
  'worklet';

  return isNativeEvent(event)
    ? event.nativeEvent.handlerTag === handlerTag
    : event.handlerTag === handlerTag;
}

export function isAnimatedEvent(
  callback: ((event: any) => void) | AnimatedEvent | undefined
): callback is AnimatedEvent {
  'worklet';

  return !!callback && '_argMapping' in callback;
}

export function checkMappingForChangeProperties(obj: Animated.Mapping) {
  if (!('nativeEvent' in obj) || !('handlerData' in obj.nativeEvent)) {
    return;
  }

  for (const key in obj.nativeEvent.handlerData) {
    if (key.startsWith('change')) {
      throw new Error(
        tagMessage(`${key} is not available when using Animated.Event.`)
      );
    }
  }
}

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

export function prepareConfig(config: any) {
  const copy = { ...config };

  for (const key in copy) {
    if (Reanimated?.isSharedValue(copy[key])) {
      copy[key] = copy[key].value;
    }
  }

  // TODO: Filter changes - passing functions (and possibly other types)
  // causes a native crash
  copy.onUpdate = null;

  return copy;
}

// Variant of djb2 hash function.
// Taken from https://gist.github.com/eplawless/52813b1d8ad9af510d85?permalink_comment_id=3367765#gistcomment-3367765
export function hash(str: string) {
  'worklet';
  const len = str.length;
  let h = 5381;

  for (let i = 0; i < len; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

export function isComposedGesture(
  gesture: NativeGesture | ComposedGesture
): gesture is ComposedGesture {
  return 'tags' in gesture;
}
