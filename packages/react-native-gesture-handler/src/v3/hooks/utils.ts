import { NativeSyntheticEvent } from 'react-native';
import {
  AnimatedEvent,
  BaseGestureConfig,
  GestureHandlerEvent,
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from '../types';
import { GestureTouchEvent } from '../../handlers/gestureHandlerCommon';
import { tagMessage } from '../../utils';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';

export function isNativeEvent(
  event: GestureHandlerEvent<unknown>
): event is
  | NativeSyntheticEvent<GestureUpdateEvent<unknown>>
  | NativeSyntheticEvent<GestureStateChangeEvent<unknown>>
  | NativeSyntheticEvent<GestureTouchEvent> {
  'worklet';

  return 'nativeEvent' in event;
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
  callback:
    | ((event: GestureUpdateEvent<unknown>) => void)
    | AnimatedEvent
    | undefined
): callback is AnimatedEvent {
  'worklet';

  return !!callback && '_argMapping' in callback;
}

export function checkMappingForChangeProperties(animatedEvent: AnimatedEvent) {
  for (const mapping of animatedEvent._argMapping) {
    if (
      !mapping ||
      !('nativeEvent' in mapping && 'handlerData' in mapping.nativeEvent)
    ) {
      continue;
    }

    for (const key in mapping.nativeEvent.handlerData) {
      if (key.startsWith('change')) {
        throw new Error(
          tagMessage(`${key} is not available when using Animated.Event.`)
        );
      }
    }
  }
}

export function prepareConfig(config: BaseGestureConfig<unknown>) {
  const copy = { ...config };

  for (const key in copy) {
    if (Reanimated?.isSharedValue(copy[key])) {
      copy[key] = copy[key].value;
    }
  }

  // TODO: Filter changes - passing functions (and possibly other types)
  // causes a native crash
  delete copy.onUpdate;
  delete copy.simultaneousWithExternalGesture;
  delete copy.requireExternalGestureToFail;
  delete copy.blocksExternalGesture;

  return copy;
}

export function shouldHandleTouchEvents(config: BaseGestureConfig<unknown>) {
  return (
    !!config.onTouchesDown ||
    !!config.onTouchesMove ||
    !!config.onTouchesUp ||
    !!config.onTouchesCancelled
  );
}
