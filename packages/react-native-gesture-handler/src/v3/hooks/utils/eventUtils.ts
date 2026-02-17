import { NativeSyntheticEvent } from 'react-native';
import {
  AnimatedEvent,
  BaseGestureConfig,
  ChangeCalculatorType,
  DiffCalculatorType,
  GestureHandlerEventWithHandlerData,
  GestureStateChangeEventWithHandlerData,
  GestureUpdateEventWithHandlerData,
  GestureEvent,
} from '../../types';
import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';
import { tagMessage } from '../../../utils';

function isNativeEvent<THandlerData, TExtendedHandlerData extends THandlerData>(
  event: GestureHandlerEventWithHandlerData<THandlerData, TExtendedHandlerData>
): event is
  | NativeSyntheticEvent<
      GestureUpdateEventWithHandlerData<TExtendedHandlerData>
    >
  | NativeSyntheticEvent<GestureStateChangeEventWithHandlerData<THandlerData>>
  | NativeSyntheticEvent<GestureTouchEvent> {
  'worklet';

  return 'nativeEvent' in event;
}

export function maybeExtractNativeEvent<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  event: GestureHandlerEventWithHandlerData<THandlerData, TExtendedHandlerData>
):
  | GestureTouchEvent
  | GestureUpdateEventWithHandlerData<TExtendedHandlerData>
  | GestureStateChangeEventWithHandlerData<THandlerData> {
  'worklet';

  return isNativeEvent(event) ? event.nativeEvent : event;
}

export function flattenAndFilterEvent<THandlerData>(
  event:
    | GestureUpdateEventWithHandlerData<THandlerData>
    | GestureStateChangeEventWithHandlerData<THandlerData>
): GestureEvent<THandlerData> {
  'worklet';

  return { handlerTag: event.handlerTag, ...event.handlerData };
}

export function isEventForHandlerWithTag<
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  handlerTag: number,
  event:
    | GestureStateChangeEventWithHandlerData<THandlerData>
    | GestureUpdateEventWithHandlerData<TExtendedHandlerData>
    | GestureTouchEvent
) {
  'worklet';

  return event.handlerTag === handlerTag;
}

export function isNativeAnimatedEvent<THandlerData>(
  callback:
    | ((event: GestureEvent<THandlerData>) => void)
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

export function shouldHandleTouchEvents<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>) {
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
