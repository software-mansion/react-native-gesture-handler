import { useEffect, useMemo } from 'react';
import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { useGestureEvent } from './useGestureEvent';
import {
  Reanimated,
  SharedValue,
} from '../../handlers/gestures/reanimatedWrapper';
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

const sharedValues = new Map<
  string,
  { id: number; sharedValue: SharedValue }
>();

let nextSharedValueListenerID = 0;

// This is used to obtain HostFunction that can be executed on the UI thread
const { updateGestureHandlerConfig } = RNGestureHandlerModule;

function maybeExtractSharedValues(config: any, tag: number) {
  if (Reanimated === undefined) {
    return;
  }

  const attachListener = (
    sharedValue: SharedValue,
    id: number,
    configKey: string
  ) => {
    'worklet';

    sharedValue.addListener(id, (value) => {
      updateGestureHandlerConfig(tag, { [configKey]: value });
    });
  };

  for (const [key, maybeSharedValue] of Object.entries(config)) {
    if (!Reanimated.isSharedValue(maybeSharedValue)) {
      continue;
    }

    sharedValues.set(key, {
      id: nextSharedValueListenerID,
      sharedValue: maybeSharedValue,
    });

    config[key] = maybeSharedValue.value;

    Reanimated.runOnUI(attachListener)(
      maybeSharedValue,
      nextSharedValueListenerID,
      key
    );

    nextSharedValueListenerID++;
  }
}

function maybeDetachSharedValues() {
  if (Reanimated === undefined) {
    return;
  }

  for (const [key, { id, sharedValue }] of sharedValues.entries()) {
    Reanimated.runOnUI(() => {
      sharedValue.removeListener(id);
    })();

    sharedValues.delete(key);
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

  useMemo(() => {
    RNGestureHandlerModule.createGestureHandler(type, tag, {});
    RNGestureHandlerModule.flushOperations();
  }, [type, tag]);

  useEffect(() => {
    maybeExtractSharedValues(config, tag);

    return () => {
      maybeDetachSharedValues();
      RNGestureHandlerModule.dropGestureHandler(tag);
      RNGestureHandlerModule.flushOperations();
    };
  }, [type, tag, config]);

  useEffect(() => {
    // TODO: filter changes - passing functions (and possibly other types)
    // causes a native crash
    const animatedEvent = config.onUpdate;
    config.onUpdate = null;
    RNGestureHandlerModule.setGestureHandlerConfig(tag, config);
    config.onUpdate = animatedEvent;

    RNGestureHandlerModule.flushOperations();
  }, [config, tag]);

  return {
    tag: [tag],
    name: type,
    config,
    gestureEvents: {
      onGestureHandlerStateChange,
      onGestureHandlerEvent,
      onGestureHandlerTouchEvent,
      onGestureHandlerAnimatedEvent,
    },
  };
}
