import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { tagMessage } from '../../../utils';
import {
  BaseGestureConfig,
  CommonGestureConfig,
  ExcludeInternalConfigProps,
  GestureCallbacks,
  HandlersPropsWhiteList,
  InternalConfigProps,
  SingleGestureName,
} from '../../types';
import { PanNativeProperties } from '../gestures/pan/PanProperties';
import { FlingNativeProperties } from '../gestures/fling/FlingProperties';
import { HoverNativeProperties } from '../gestures/hover/HoverProperties';
import { LongPressNativeProperties } from '../gestures/longPress/LongPressProperties';
import { NativeHandlerNativeProperties } from '../gestures/native/NativeProperties';
import { TapNativeProperties } from '../gestures/tap/TapProperties';
import { hasWorkletEventHandlers, maybeUnpackValue } from './reanimatedUtils';
import { isAnimatedEvent, shouldHandleTouchEvents } from './eventUtils';

export function prepareConfig<THandlerData, TConfig extends object>(
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  const runOnJS = maybeUnpackValue(config.runOnJS);

  config.shouldUseReanimatedDetector =
    !config.disableReanimated &&
    Reanimated !== undefined &&
    hasWorkletEventHandlers(config);
  config.needsPointerData = shouldHandleTouchEvents(config);
  config.dispatchesAnimatedEvents = isAnimatedEvent(config.onUpdate);
  config.dispatchesReanimatedEvents =
    config.shouldUseReanimatedDetector && !runOnJS;
}

const allowedNativeProps = new Set<
  keyof CommonGestureConfig | keyof InternalConfigProps<unknown>
>([
  // CommonGestureConfig
  'disableReanimated',
  'enabled',
  'shouldCancelWhenOutside',
  'hitSlop',
  'userSelect',
  'activeCursor',
  'mouseButton',
  'enableContextMenu',
  'touchAction',

  // InternalConfigProps
  'dispatchesReanimatedEvents',
  'dispatchesAnimatedEvents',
  'needsPointerData',
  'changeEventCalculator',
]);

export const HandlerCallbacks = new Set<
  keyof Required<GestureCallbacks<unknown>>
>([
  'onBegin',
  'onStart',
  'onUpdate',
  'onEnd',
  'onFinalize',
  'onTouchesDown',
  'onTouchesMove',
  'onTouchesUp',
  'onTouchesCancelled',
]);

const PropsToFilter = new Set<BaseGestureConfig<unknown, unknown>>([
  ...HandlerCallbacks,

  // Config props
  'changeEventCalculator',
  'disableReanimated',

  // Relations
  'simultaneousWithExternalGesture',
  'requireExternalGestureToFail',
  'blocksExternalGesture',
]);

export const PropsWhiteLists = new Map<
  SingleGestureName,
  HandlersPropsWhiteList
>([
  [SingleGestureName.Pan, PanNativeProperties],
  [SingleGestureName.Tap, TapNativeProperties],
  [SingleGestureName.Native, NativeHandlerNativeProperties],
  [SingleGestureName.Fling, FlingNativeProperties],
  [SingleGestureName.Hover, HoverNativeProperties],
  [SingleGestureName.LongPress, LongPressNativeProperties],
]);

const EMPTY_WHITE_LIST = new Set<string>();

export function prepareConfigForNativeSide<THandlerData, TConfig>(
  handlerType: SingleGestureName,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  // @ts-ignore Seems like TypeScript can't infer the type here properly because of generic
  const filteredConfig: BaseGestureConfig<THandlerData, TConfig> = {};
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
