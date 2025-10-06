import { NativeSyntheticEvent } from 'react-native';
import {
  AnimatedEvent,
  BaseGestureConfig,
  ChangeCalculatorType,
  DiffCalculatorType,
  UnpackedGestureHandlerEvent,
  GestureHandlerEvent,
  GestureStateChangeEvent,
  GestureUpdateEvent,
} from '../../types';
import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';
import { tagMessage } from '../../../utils';

export function isNativeEvent<THandlerData>(
  event: GestureHandlerEvent<THandlerData>
): event is
  | NativeSyntheticEvent<GestureUpdateEvent<THandlerData>>
  | NativeSyntheticEvent<GestureStateChangeEvent<THandlerData>>
  | NativeSyntheticEvent<GestureTouchEvent> {
  'worklet';

  return 'nativeEvent' in event;
}

export function maybeExtractNativeEvent<THandlerData>(
  event: GestureHandlerEvent<THandlerData>
) {
  'worklet';

  return isNativeEvent(event) ? event.nativeEvent : event;
}

export function isEventForHandlerWithTag<THandlerData>(
  handlerTag: number,
  event: UnpackedGestureHandlerEvent<THandlerData>
) {
  'worklet';

  return event.handlerTag === handlerTag;
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

export function getChangeEventCalculator<THandlerData>(
  diffCalculator: DiffCalculatorType<THandlerData>
): ChangeCalculatorType<THandlerData> {
  'worklet';
  return (
    current: GestureUpdateEvent<THandlerData>,
    previous?: GestureUpdateEvent<THandlerData>
  ) => {
    'worklet';
    const currentEventData = current.handlerData;
    const previousEventData = previous ? previous.handlerData : null;

    const changePayload = diffCalculator(currentEventData, previousEventData);

    current.handlerData = { ...currentEventData, ...changePayload };

    return current;
  };
}
