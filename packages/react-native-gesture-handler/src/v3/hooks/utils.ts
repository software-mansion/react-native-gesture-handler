import { NativeSyntheticEvent } from 'react-native';
import {
  AnimatedEvent,
  BaseGestureConfig,
  ChangeCalculatorType,
  CommonGestureConfig,
  DiffCalculatorType,
  ExcludeInternalConfigProps,
  UnpackedGestureHandlerEvent,
  GestureHandlerEvent,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  SharedValueOrT,
  SingleGestureName,
  HandlersPropsWhiteList,
  InternalConfigProps,
} from '../types';
import { GestureTouchEvent } from '../../handlers/gestureHandlerCommon';
import { tagMessage } from '../../utils';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import { panGestureHandlerProps } from '../../handlers/PanGestureHandler';
import { tapGestureHandlerProps } from '../../handlers/TapGestureHandler';
import { nativeViewGestureHandlerProps } from '../../handlers/NativeViewGestureHandler';
import { longPressGestureHandlerProps } from '../../handlers/LongPressGestureHandler';
import { flingGestureHandlerProps } from '../../handlers/FlingGestureHandler';

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

export function maybeUnpackValue<T>(v: SharedValueOrT<T>) {
  'worklet';

  return (Reanimated?.isSharedValue(v) ? v.value : v) as T;
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

export const commonGestureConfig = new Set<keyof CommonGestureConfig>([
  'disableReanimated',
  'enabled',
  'shouldCancelWhenOutside',
  'hitSlop',
  'userSelect',
  'activeCursor',
  'mouseButton',
  'enableContextMenu',
  'touchAction',
]);

export const internalConfigProps = new Set<keyof InternalConfigProps<unknown>>([
  'shouldUseReanimated',
  'dispatchesAnimatedEvents',
  'needsPointerData',
  'changeEventCalculator',
]);

const PropsToFilter = new Set<BaseGestureConfig<unknown, unknown>>([
  // Callbacks
  'onBegin',
  'onStart',
  'onUpdate',
  'onEnd',
  'onFinalize',
  'onTouchesDown',
  'onTouchesMove',
  'onTouchesUp',
  'onTouchesCancelled',

  // Config props
  'changeEventCalculator',
  'disableReanimated',

  // Relations
  'simultaneousWithExternalGesture',
  'requireExternalGestureToFail',
  'blocksExternalGesture',
]);

function withCommonProps<T extends string>(handlerProps: readonly T[]) {
  return new Set<
    T | keyof CommonGestureConfig | keyof InternalConfigProps<unknown>
  >([...handlerProps, ...commonGestureConfig, ...internalConfigProps]);
}

export const PropsWhiteList = new Map<
  SingleGestureName,
  HandlersPropsWhiteList
>([
  [SingleGestureName.Pan, withCommonProps(panGestureHandlerProps)],
  [SingleGestureName.Tap, withCommonProps(tapGestureHandlerProps)],
  [SingleGestureName.Native, withCommonProps(nativeViewGestureHandlerProps)],
  [SingleGestureName.LongPress, withCommonProps(longPressGestureHandlerProps)],
  [SingleGestureName.Fling, withCommonProps(flingGestureHandlerProps)],
]);

const EMPTY_WHILE_LIST = new Set<string>();

export function prepareConfig<THandlerData, TConfig extends object>(
  handlerType: SingleGestureName,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  // @ts-ignore Seems like TypeScript can't infer the type here properly because of generic
  const filteredConfig: BaseGestureConfig<THandlerData, TConfig> = {};
  const propsWhiteList = PropsWhiteList.get(handlerType) ?? EMPTY_WHILE_LIST;

  for (const [key, value] of Object.entries(config)) {
    if (propsWhiteList.has(key)) {
      Object.assign(filteredConfig, {
        [key]: Reanimated?.isSharedValue(value) ? value.value : value,
      });
    } else if (PropsToFilter.has(key)) {
      continue;
    } else {
      console.warn(
        tagMessage(
          `${key} is not a valid property for ${handlerType} and will be ignored.`
        )
      );
    }
  }

  return filteredConfig;
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
  config: TConfig & TInternalConfig,
  propsMapping: Map<string, string>
): TInternalConfig {
  type MergedConfig = TConfig & TInternalConfig;

  propsMapping.forEach((internalKey, key) => {
    if (key in config) {
      config[internalKey as keyof MergedConfig] =
        config[key as keyof MergedConfig];

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete config[key as keyof MergedConfig];
    }
  });

  return config;
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
