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

export function isNativeEvent<THandlerData>(
  event: GestureHandlerEvent<THandlerData>
): event is
  | NativeSyntheticEvent<GestureUpdateEvent<THandlerData>>
  | NativeSyntheticEvent<GestureStateChangeEvent<THandlerData>>
  | NativeSyntheticEvent<GestureTouchEvent> {
  'worklet';

  return 'nativeEvent' in event;
}

export function isEventForHandlerWithTag<THandlerData>(
  handlerTag: number,
  event: GestureHandlerEvent<THandlerData>
) {
  'worklet';

  return isNativeEvent(event)
    ? event.nativeEvent.handlerTag === handlerTag
    : event.handlerTag === handlerTag;
}

export function isAnimatedEvent<THandlerData>(
  callback:
    | ((event: GestureUpdateEvent<THandlerData>) => void)
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

export function prepareConfig<THandlerData, TConfig>(
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  const copy = { ...config };

  for (const key in copy) {
    // @ts-ignore It is fine to use string as index
    if (Reanimated?.isSharedValue(copy[key])) {
      // @ts-ignore It is fine to use string as index
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

export function shouldHandleTouchEvents<THandlerData, TConfig>(
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  return (
    !!config.onTouchesDown ||
    !!config.onTouchesMove ||
    !!config.onTouchesUp ||
    !!config.onTouchesCancelled
  );
}

// Some event handlers are plain functions, whereas those marked as worklets
// are wrapped in objects under eventMethod.workletEventHandler.worklet.
// This function normalises invocation so that both forms can be called safely.
// Note: this worklet unpacking is essentially a workaround since we need to
// decide on the JS side which handle logic to execute.
export function invokeDetectorEvent(
  method:
    | ((event: any) => void)
    | { workletEventHandler: { worklet: (event: any) => void } }
    | null
    | undefined,
  event: any
): void {
  if (!method) {
    return;
  }

  if (typeof method === 'function') {
    method(event);
    return;
  }

  if ('workletEventHandler' in method) {
    if ('worklet' in method.workletEventHandler) {
      invokeDetectorEvent(method.workletEventHandler.worklet, event);
    }
    return;
  }
}
