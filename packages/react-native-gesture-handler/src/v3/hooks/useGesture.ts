import { useEffect, useMemo } from 'react';
import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { useGestureCallbacks } from './useGestureCallbacks';
import {
  Reanimated,
  SharedValue,
} from '../../handlers/gestures/reanimatedWrapper';
import { hash, prepareConfig, isAnimatedEvent } from './utils';
import { tagMessage } from '../../utils';
import { GestureType, NativeGesture } from '../types';

function hasWorkletEventHandlers(config: Record<string, unknown>) {
  return Object.values(config).some(
    (prop) => typeof prop === 'function' && '__workletHash' in prop
  );
}

function shouldHandleTouchEvents(config: Record<string, unknown>) {
  return (
    !!config.onTouchesDown ||
    !!config.onTouchesMove ||
    !!config.onTouchesUp ||
    !!config.onTouchesCancelled
  );
}

const SHARED_VALUE_OFFSET = 1.618;

// This is used to obtain HostFunction that can be executed on the UI thread
const { updateGestureHandlerConfig, flushOperations } = RNGestureHandlerModule;

function bindSharedValues(config: any, handlerTag: number) {
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

function unbindSharedValues(config: any, handlerTag: number) {
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

export function useGesture(
  type: GestureType,
  config: Record<string, unknown>
): NativeGesture {
  const tag = useMemo(() => getNextHandlerTag(), []);
  const disableReanimated = useMemo(() => config.disableReanimated, []);

  if (config.disableReanimated !== disableReanimated) {
    throw new Error(
      tagMessage(
        'The "disableReanimated" property must not be changed after the handler is created.'
      )
    );
  }

  // This has to be done ASAP as other hooks depend `shouldUseReanimated`.
  config.shouldUseReanimated =
    !config.disableReanimated &&
    Reanimated !== undefined &&
    hasWorkletEventHandlers(config);
  config.needsPointerData = shouldHandleTouchEvents(config);
  // TODO: Remove this when we properly type config
  config.dispatchesAnimatedEvents = isAnimatedEvent(config.onUpdate as any);

  if (config.dispatchesAnimatedEvents && config.shouldUseReanimated) {
    throw new Error(
      tagMessage('Cannot use Reanimated and Animated events at the same time.')
    );
  }

  // TODO: Call only necessary hooks depending on which callbacks are defined (?)
  const {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerTouchEvent,
    onReanimatedStateChange,
    onReanimatedUpdateEvent,
    onReanimatedTouchEvent,
    onGestureHandlerAnimatedEvent,
  } = useGestureCallbacks(tag, config);

  // This should never happen, but since we don't want to call hooks conditionally,
  // we have to mark these as possibly undefined to make TypeScript happy.
  if (
    !onGestureHandlerStateChange ||
    // If onUpdate is an AnimatedEvent, `onGestureHandlerEvent` will be undefined and vice versa.
    (!onGestureHandlerEvent && !onGestureHandlerAnimatedEvent) ||
    !onGestureHandlerTouchEvent
  ) {
    throw new Error(tagMessage('Failed to create event handlers.'));
  }

  if (
    config.shouldUseReanimated &&
    (!onReanimatedStateChange ||
      !onReanimatedUpdateEvent ||
      !onReanimatedTouchEvent)
  ) {
    throw new Error(tagMessage('Failed to create reanimated event handlers.'));
  }

  useMemo(() => {
    RNGestureHandlerModule.createGestureHandler(type, tag, {});
    RNGestureHandlerModule.flushOperations();
  }, [type, tag]);

  useEffect(() => {
    return () => {
      RNGestureHandlerModule.dropGestureHandler(tag);
      RNGestureHandlerModule.flushOperations();
    };
  }, [type, tag]);

  useEffect(() => {
    bindSharedValues(config, tag);

    return () => {
      unbindSharedValues(config, tag);
    };
  }, [tag, config]);

  useEffect(() => {
    const preparedConfig = prepareConfig(config);

    RNGestureHandlerModule.setGestureHandlerConfig(tag, preparedConfig);

    RNGestureHandlerModule.flushOperations();
  }, [config, tag]);

  return {
    tag,
    name: type,
    config,
    gestureEvents: {
      onGestureHandlerStateChange,
      onGestureHandlerEvent,
      onGestureHandlerTouchEvent,
      onReanimatedStateChange,
      onReanimatedUpdateEvent,
      onReanimatedTouchEvent,
      onGestureHandlerAnimatedEvent,
    },
    simultaneousHandlers: [],
    waitFor: [],
  };
}
