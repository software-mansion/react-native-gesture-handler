import { isSharedValue } from '../../platform/isSharedValue';
import type { CoreRuntime } from '../../platform/Port';
import type {
  BaseGestureConfig,
  Gesture,
  SharedValue,
  SharedValueOrT,
} from '../../types';
import { HandlerCallbacks } from './propsWhiteList';
import { isComposedGesture } from './relationUtils';

// Variant of djb2 hash function.
// Taken from https://gist.github.com/eplawless/52813b1d8ad9af510d85?permalink_comment_id=3367765#gistcomment-3367765
function hash(str: string) {
  'worklet';
  const len = str.length;
  let h = 5381;

  for (let i = 0; i < len; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

export const SHARED_VALUE_OFFSET = 1.618;

export function bindSharedValues<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  runtime: CoreRuntime,
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>,
  handlerTag: number
) {
  const reanimated = runtime.port.reanimated;
  if (reanimated === undefined) {
    return;
  }

  const baseListenerId = handlerTag + SHARED_VALUE_OFFSET;
  const { shouldUseReanimatedDetector } = config;
  // Don't transfer the entire proxy to the UI thread — the worklet below must
  // capture only the single UI-callable member.
  const { updateGestureHandlerConfig } = runtime.port.proxy;

  const attachListener = (sharedValue: SharedValue, configKey: string) => {
    'worklet';
    const keyHash = hash(configKey);
    const listenerId = baseListenerId + keyHash;

    sharedValue.addListener(listenerId, (value) => {
      updateGestureHandlerConfig(
        handlerTag,
        configKey === 'runOnJS'
          ? {
              dispatchesReanimatedEvents: shouldUseReanimatedDetector && !value,
            }
          : { [configKey]: value }
      );
    });
  };

  for (const [key, maybeSharedValue] of Object.entries(config)) {
    if (!isSharedValue(maybeSharedValue)) {
      continue;
    }

    reanimated.runOnUI(attachListener)(maybeSharedValue, key);
  }
}

export function unbindSharedValues<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  runtime: CoreRuntime,
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>,
  handlerTag: number
) {
  const reanimated = runtime.port.reanimated;
  if (reanimated === undefined) {
    return;
  }

  const baseListenerId = handlerTag + SHARED_VALUE_OFFSET;

  for (const [key, maybeSharedValue] of Object.entries(config)) {
    if (!isSharedValue(maybeSharedValue)) {
      continue;
    }

    const keyHash = hash(key);
    const listenerId = baseListenerId + keyHash;

    reanimated.runOnUI(() => {
      maybeSharedValue.removeListener(listenerId);
    })();
  }
}

export function hasWorkletEventHandlers<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>) {
  for (const key of HandlerCallbacks) {
    const value = config[key];

    if (typeof value === 'function' && '__workletHash' in value) {
      return true;
    }
  }

  return false;
}

export function maybeUnpackValue<T>(
  v: SharedValueOrT<T, boolean> | undefined
): T {
  'worklet';

  return (isSharedValue(v) ? v.value : v) as T;
}

export function getEnabledSharedValues<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>
): SharedValue<boolean>[] {
  if (isComposedGesture(gesture)) {
    return gesture.gestures.flatMap(getEnabledSharedValues);
  }

  const enabled = gesture.config.enabled;
  return isSharedValue<boolean>(enabled) ? [enabled] : [];
}
