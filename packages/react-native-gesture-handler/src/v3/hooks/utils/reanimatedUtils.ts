import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { BaseGestureConfig, SharedValue } from '../../types';
import { HandlerCallbacks } from '../utils';

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

const SHARED_VALUE_OFFSET = 1.618;

// This is used to obtain HostFunction that can be executed on the UI thread
const { updateGestureHandlerConfig, flushOperations } = RNGestureHandlerModule;

export function bindSharedValues<THandlerData, TConfig>(
  config: BaseGestureConfig<THandlerData, TConfig>,
  handlerTag: number
) {
  if (Reanimated === undefined) {
    return;
  }

  const baseListenerId = handlerTag + SHARED_VALUE_OFFSET;

  const attachListener = (sharedValue: SharedValue, configKey: string) => {
    'worklet';
    const keyHash = hash(configKey);
    const listenerId = baseListenerId + keyHash;

    sharedValue.addListener(listenerId, (value) => {
      updateGestureHandlerConfig(handlerTag, { [configKey]: value });
      flushOperations();
    });
  };

  for (const [key, maybeSharedValue] of Object.entries(config)) {
    if (!Reanimated.isSharedValue(maybeSharedValue)) {
      continue;
    }

    Reanimated.runOnUI(attachListener)(maybeSharedValue, key);
  }
}

export function unbindSharedValues<THandlerData, TConfig>(
  config: BaseGestureConfig<THandlerData, TConfig>,
  handlerTag: number
) {
  if (Reanimated === undefined) {
    return;
  }

  const baseListenerId = handlerTag + SHARED_VALUE_OFFSET;

  for (const [key, maybeSharedValue] of Object.entries(config)) {
    if (!Reanimated.isSharedValue(maybeSharedValue)) {
      continue;
    }

    const keyHash = hash(key);
    const listenerId = baseListenerId + keyHash;

    Reanimated.runOnUI(() => {
      maybeSharedValue.removeListener(listenerId);
    })();
  }
}

export function hasWorkletEventHandlers<THandlerData, TConfig>(
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  return Object.entries(config).some(
    (key, value) =>
      (key as keyof BaseGestureConfig<THandlerData, TConfig>) in
        HandlerCallbacks &&
      typeof value === 'function' &&
      '__workletHash' in value
  );
}
