import { useEffect, useMemo } from 'react';
import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { useGestureEvent } from './useGestureEvent';
import {
  Reanimated,
  SharedValue,
} from '../../handlers/gestures/reanimatedWrapper';
import { tagMessage } from '../../utils';
import {
  ComposedGesture,
  Gesture,
  GestureRelations,
  NativeGesture,
  SingleGestureType,
} from '../types';
import { hash, isComposedGesture, prepareConfig } from './utils';

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

function prepareRelations(config: any): GestureRelations {
  const extractHandlerTags = (otherHandler: Gesture | Gesture[]): number[] => {
    if (!otherHandler) {
      return [];
    }

    let otherTags: number[];

    if (Array.isArray(otherHandler)) {
      otherTags = otherHandler.flatMap(
        (gesture: NativeGesture | ComposedGesture) =>
          isComposedGesture(gesture) ? gesture.tags : gesture.tag
      );
    } else {
      otherTags = isComposedGesture(otherHandler)
        ? otherHandler.tags
        : [otherHandler.tag];
    }

    return otherTags;
  };

  return {
    simultaneousHandlers: extractHandlerTags(
      config.simultaneousWithExternalGesture
    ),
    waitFor: extractHandlerTags(config.requireExternalGestureToFail),
    blocksHandlers: extractHandlerTags(config.blocksExternalGesture),
  };
}

export function useGesture(
  type: SingleGestureType,
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
    Reanimated !== undefined && hasWorkletEventHandlers(config);
  config.needsPointerData = shouldHandleTouchEvents(config);

  const {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerAnimatedEvent,
    onGestureHandlerTouchEvent,
  } = useGestureEvent(tag, config);

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

  config.dispatchesAnimatedEvents =
    !!onGestureHandlerAnimatedEvent &&
    '__isNative' in onGestureHandlerAnimatedEvent;

  const gestureRelations = prepareRelations(config);

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
    type,
    config,
    gestureEvents: {
      onGestureHandlerStateChange,
      onGestureHandlerEvent,
      onGestureHandlerTouchEvent,
      onGestureHandlerAnimatedEvent,
    },
    gestureRelations,
  };
}
