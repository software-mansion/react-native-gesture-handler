import type { HitSlop } from '../../../handlers/gestureHandlerCommon';
import {
  Reanimated,
  Worklets,
} from '../../../handlers/gestures/reanimatedWrapper';
import { normalizeHitSlop } from '../../../handlers/hitSlop';
import { NativeProxy } from '../../NativeProxy';
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

// Don't transfer entire NativeProxy to the UI thread
const { updateGestureHandlerConfig } = NativeProxy;

export function bindSharedValues<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>,
  handlerTag: number
) {
  const scheduleOnUI = Worklets?.scheduleOnUI;

  if (Reanimated === undefined || scheduleOnUI === undefined) {
    return;
  }

  const baseListenerId = handlerTag + SHARED_VALUE_OFFSET;
  const { shouldUseReanimatedDetector } = config;

  const attachListener = (sharedValue: SharedValue, configKey: string) => {
    'worklet';
    const keyHash = hash(configKey);
    const listenerId = baseListenerId + keyHash;

    sharedValue.addListener(listenerId, (value) => {
      if (configKey === 'runOnJS') {
        updateGestureHandlerConfig(handlerTag, {
          dispatchesReanimatedEvents: shouldUseReanimatedDetector && !value,
        });
        return;
      }

      if (configKey === 'hitSlop') {
        updateGestureHandlerConfig(handlerTag, {
          hitSlop: normalizeHitSlop(value as HitSlop),
        });
        return;
      }

      updateGestureHandlerConfig(handlerTag, { [configKey]: value });
    });
  };

  for (const [key, maybeSharedValue] of Object.entries(config)) {
    if (!Reanimated.isSharedValue(maybeSharedValue)) {
      continue;
    }

    scheduleOnUI(attachListener, maybeSharedValue, key);
  }
}

export function unbindSharedValues<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>,
  handlerTag: number
) {
  const scheduleOnUI = Worklets?.scheduleOnUI;

  if (Reanimated === undefined || scheduleOnUI === undefined) {
    return;
  }

  const baseListenerId = handlerTag + SHARED_VALUE_OFFSET;

  for (const [key, maybeSharedValue] of Object.entries(config)) {
    if (!Reanimated.isSharedValue(maybeSharedValue)) {
      continue;
    }

    const keyHash = hash(key);
    const listenerId = baseListenerId + keyHash;

    scheduleOnUI(() => {
      maybeSharedValue.removeListener(listenerId);
    });
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

  return (Reanimated?.isSharedValue(v) ? v.value : v) as T;
}

export function getEnabledSharedValues<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>
): SharedValue<boolean>[] {
  if (Reanimated === undefined) {
    return [];
  }

  if (isComposedGesture(gesture)) {
    return gesture.gestures.flatMap(getEnabledSharedValues);
  }

  const enabled = gesture.config.enabled;
  return Reanimated.isSharedValue<boolean>(enabled) ? [enabled] : [];
}
