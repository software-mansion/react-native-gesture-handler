import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { tagMessage } from '../../../utils';
import {
  BaseGestureConfig,
  CommonGestureConfig,
  ExcludeInternalConfigProps,
  HandlersPropsWhiteList,
  InternalConfigProps,
  SingleGestureName,
} from '../../types';
import { panGestureHandlerProps } from '../../../handlers/PanGestureHandler';
import { tapGestureHandlerProps } from '../../../handlers/TapGestureHandler';
import { nativeViewGestureHandlerProps } from '../../../handlers/NativeViewGestureHandler';
import { longPressGestureHandlerProps } from '../../../handlers/LongPressGestureHandler';
import { flingGestureHandlerProps } from '../../../handlers/FlingGestureHandler';

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

const EMPTY_WHITE_LIST = new Set<string>();

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

export function prepareConfig<THandlerData, TConfig extends object>(
  handlerType: SingleGestureName,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  // @ts-ignore Seems like TypeScript can't infer the type here properly because of generic
  const filteredConfig: BaseGestureConfig<THandlerData, TConfig> = {};
  const propsWhiteList = PropsWhiteList.get(handlerType) ?? EMPTY_WHITE_LIST;

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
