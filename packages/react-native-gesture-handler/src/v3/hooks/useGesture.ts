import { useEffect, useMemo } from 'react';
import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { useGestureEvent } from './useGestureEvent';
import {
  Reanimated,
  SharedValue,
} from '../../handlers/gestures/reanimatedWrapper';
import { tagMessage } from '../../utils';
import { AnimatedEvent } from '../types';

type GestureType =
  | 'TapGestureHandler'
  | 'LongPressGestureHandler'
  | 'PanGestureHandler'
  | 'PinchGestureHandler'
  | 'RotationGestureHandler'
  | 'FlingGestureHandler'
  | 'ForceTouchGestureHandler'
  | 'ManualGestureHandler'
  | 'NativeViewGestureHandler';

type GestureEvents = {
  onGestureHandlerStateChange: (event: any) => void;
  onGestureHandlerEvent: undefined | ((event: any) => void);
  onGestureHandlerTouchEvent: (event: any) => void;
  onGestureHandlerAnimatedEvent: undefined | AnimatedEvent;
};

export interface NativeGesture {
  tag: number;
  name: GestureType;
  config: Record<string, unknown>;
  gestureEvents: GestureEvents;
}

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
let sharedValues: SharedValue[] = [];

// This is used to obtain HostFunction that can be executed on the UI thread
const { updateGestureHandlerConfig } = RNGestureHandlerModule;

function maybeExtractSharedValues(config: any, tag: number) {
  if (Reanimated === undefined) {
    return;
  }

  const listenerId = tag + SHARED_VALUE_OFFSET;

  const attachListener = (sharedValue: SharedValue, configKey: string) => {
    'worklet';
    sharedValue.addListener(listenerId, (value) => {
      updateGestureHandlerConfig(tag, { [configKey]: value });
    });
  };

  for (const [key, maybeSharedValue] of Object.entries(config)) {
    if (!Reanimated.isSharedValue(maybeSharedValue)) {
      continue;
    }

    sharedValues.push(maybeSharedValue);

    config[key] = maybeSharedValue.value;

    Reanimated.runOnUI(attachListener)(maybeSharedValue, key);
  }
}

function maybeDetachSharedValues(tag: number) {
  if (Reanimated === undefined) {
    return;
  }

  const listenerId = tag + SHARED_VALUE_OFFSET;

  sharedValues.forEach((sharedValue) => {
    // @ts-ignore Reanimated won't be undefined because we check it above
    Reanimated.runOnUI(() => {
      sharedValue.removeListener(listenerId);
    })();
  });

  sharedValues = [];
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
    return () => {
      RNGestureHandlerModule.dropGestureHandler(tag);
      RNGestureHandlerModule.flushOperations();
    };
  }, [type, tag]);

  useEffect(() => {
    maybeExtractSharedValues(config, tag);

    return () => {
      maybeDetachSharedValues(tag);
    };
  }, [tag, config]);

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
    tag: tag,
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
