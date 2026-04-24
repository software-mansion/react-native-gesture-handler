import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { tagMessage } from '../../../utils';
import {
  BaseGestureConfig,
  ExcludeInternalConfigProps,
  SingleGestureName,
} from '../../types';
import { hasWorkletEventHandlers, maybeUnpackValue } from './reanimatedUtils';
import { isNativeAnimatedEvent, shouldHandleTouchEvents } from './eventUtils';
import {
  allowedNativeProps,
  EMPTY_WHITE_LIST,
  PropsToFilter,
  PropsWhiteLists,
} from './propsWhiteList';
import { useMemo } from 'react';

export function prepareConfig<
  TConfig extends object,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>) {
  const runOnJS = maybeUnpackValue(config.runOnJS);

  if (
    __DEV__ &&
    isNativeAnimatedEvent(config.onUpdate) &&
    !config.useAnimated
  ) {
    console.warn(
      tagMessage(
        'You are using Animated.event in onUpdate without setting useAnimated to true. ' +
          'This may lead to unexpected behavior. If you intend to use Animated.event, ' +
          'please set useAnimated to true in the gesture config.'
      )
    );
  }

  config.dispatchesAnimatedEvents =
    config.useAnimated || isNativeAnimatedEvent(config.onUpdate);

  // Validate that the user is not trying to mix Animated and Reanimated before updating the config.
  if (
    __DEV__ &&
    config.dispatchesAnimatedEvents &&
    (config.disableReanimated === false || config.runOnJS === false)
  ) {
    throw new Error(
      tagMessage(
        'Animated cannot be used together with Reanimated in the same gesture. Please choose either Animated or Reanimated for handling gesture events.'
      )
    );
  }

  if (config.dispatchesAnimatedEvents) {
    config.disableReanimated = true;
  }

  config.shouldUseReanimatedDetector =
    !config.disableReanimated &&
    Reanimated !== undefined &&
    hasWorkletEventHandlers(config) &&
    !config.dispatchesAnimatedEvents;
  config.needsPointerData = shouldHandleTouchEvents(config);
  config.dispatchesReanimatedEvents =
    config.shouldUseReanimatedDetector && !runOnJS;
}

export function prepareConfigForNativeSide<
  TConfig extends object,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  handlerType: SingleGestureName,
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
) {
  // @ts-ignore Seems like TypeScript can't infer the type here properly because of generic
  const filteredConfig: BaseGestureConfig<
    TConfig,
    THandlerData,
    TExtendedHandlerData
  > = {};
  const handlerPropsWhiteList =
    PropsWhiteLists.get(handlerType) ?? EMPTY_WHITE_LIST;

  for (const [key, value] of Object.entries(config)) {
    // @ts-ignore That's the point, we want to see if key exists in the whitelists
    if (allowedNativeProps.has(key) || handlerPropsWhiteList.has(key)) {
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

function cloneConfig<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  config: ExcludeInternalConfigProps<
    BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
  >
): BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData> {
  return { ...config } as BaseGestureConfig<
    TConfig,
    THandlerData,
    TExtendedHandlerData
  >;
}

function remapProps<
  TConfig extends object,
  TInternalConfig extends Record<string, unknown>,
>(
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

export function useClonedAndRemappedConfig<
  TConfig extends Record<string, unknown>,
  THandlerData,
  TInternalConfig extends Record<string, unknown> = TConfig,
  TExtendedHandlerData extends THandlerData = THandlerData,
>(
  config: ExcludeInternalConfigProps<
    BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
  >,
  propsMapping: Map<string, string> = new Map(),
  propsTransformer: (config: TInternalConfig) => TInternalConfig = (cfg) => cfg
): BaseGestureConfig<TInternalConfig, THandlerData, TExtendedHandlerData> {
  return useMemo(() => {
    const clonedConfig = cloneConfig<
      TConfig,
      THandlerData,
      TExtendedHandlerData
    >(config);

    return propsTransformer(
      remapProps<TConfig, TInternalConfig>(
        clonedConfig as TConfig & TInternalConfig,
        propsMapping
      )
    );
  }, [config, propsMapping, propsTransformer]);
}
