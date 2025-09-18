import { NativeSyntheticEvent } from 'react-native';
import {
  AnimatedEvent,
  BaseGestureConfig,
  ChangeCalculatorType,
  DiffCalculatorType,
  ExcludeInternalConfigProps,
  ExtractedGestureHandlerEvent,
  GestureHandlerEvent,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  TOrSharedValue,
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

export function maybeExtractNativeEvent<THandlerData>(
  event: GestureHandlerEvent<THandlerData>
) {
  'worklet';

  return isNativeEvent(event) ? event.nativeEvent : event;
}

export function isEventForHandlerWithTag<THandlerData>(
  handlerTag: number,
  event: ExtractedGestureHandlerEvent<THandlerData>
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

export function maybeUnpackValue<T>(v: TOrSharedValue<T>) {
  'worklet';

  return Reanimated?.isSharedValue(v) ? v.value : v;
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

export function cloneConfig<THandlerData, TConfig>(
  config: ExcludeInternalConfigProps<BaseGestureConfig<THandlerData, TConfig>>
): BaseGestureConfig<THandlerData, TConfig> {
  return { ...config } as BaseGestureConfig<THandlerData, TConfig>;
}

export function remapProps<TConfig extends object, TInternalConfig>(
  config: TConfig,
  propsMapping: Map<string, string>
): TInternalConfig {
  type MergedConfig = TConfig & TInternalConfig;

  const newConfig = { ...config } as MergedConfig;

  propsMapping.forEach((internalKey, key) => {
    if (key in newConfig) {
      newConfig[internalKey as keyof MergedConfig] =
        newConfig[key as keyof MergedConfig];

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete newConfig[key as keyof MergedConfig];
    }
  });

  return newConfig;
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

    const resultEvent = { ...current };
    resultEvent.handlerData = { ...currentEventData, ...changePayload };

    return resultEvent;
  };
}
