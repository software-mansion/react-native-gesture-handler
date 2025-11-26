import { NativeSyntheticEvent } from 'react-native';
import {
  AnimatedEvent,
  BaseGestureConfig,
  ChangeCalculatorType,
  DiffCalculatorType,
  UnpackedGestureHandlerEventWithHandlerData,
  GestureHandlerEventWithHandlerData,
  GestureStateChangeEventWithHandlerData,
  GestureUpdateEventWithHandlerData,
} from '../../types';
import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';
import { tagMessage } from '../../../utils';

export function isNativeEvent<THandlerData>(
  event: GestureHandlerEventWithHandlerData<THandlerData>
): event is
  | NativeSyntheticEvent<GestureUpdateEventWithHandlerData<THandlerData>>
  | NativeSyntheticEvent<GestureStateChangeEventWithHandlerData<THandlerData>>
  | NativeSyntheticEvent<GestureTouchEvent> {
  'worklet';

  return 'nativeEvent' in event;
}

export function maybeExtractNativeEvent<THandlerData>(
  event: GestureHandlerEventWithHandlerData<THandlerData>
) {
  'worklet';

  return isNativeEvent(event) ? event.nativeEvent : event;
}

export function isEventForHandlerWithTag<THandlerData>(
  handlerTag: number,
  event: UnpackedGestureHandlerEventWithHandlerData<THandlerData>
) {
  'worklet';

  return event.handlerTag === handlerTag;
}

export function isNativeAnimatedEvent<THandlerData>(
  callback:
    | ((event: GestureUpdateEventWithHandlerData<THandlerData>) => void)
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
    !!config.onTouchesCancel
  );
}

export function getChangeEventCalculator<THandlerData>(
  diffCalculator: DiffCalculatorType<THandlerData>
): ChangeCalculatorType<THandlerData> {
  'worklet';
  return (
    current: GestureUpdateEventWithHandlerData<THandlerData>,
    previous?: GestureUpdateEventWithHandlerData<THandlerData>
  ) => {
    'worklet';
    const currentEventData = current.handlerData;
    const previousEventData = previous ? previous.handlerData : null;

    const changePayload = diffCalculator(currentEventData, previousEventData);

    current.handlerData = { ...currentEventData, ...changePayload };

    return current;
  };
}
