import { useEffect, useMemo } from 'react';
import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { useGestureEvent } from './useGestureEvent';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import { tagMessage } from '../../utils';

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
  onGestureHandlerEvent: (event: any) => void;
  onGestureHandlerTouchEvent: (event: any) => void;
  onGestureHandlerAnimatedEvent: (event: any) => void;
};

export interface NativeGesture {
  tag: number;
  name: GestureType;
  config: Record<string, unknown>;
  gestureEvents: GestureEvents;
  shouldUseReanimated: boolean;
  dispatchesAnimatedEvents: boolean;
}

function hasWorkletEventHandlers(config: Record<string, unknown>) {
  return Object.values(config).some(
    // @ts-ignore `__workletHash` comes from Reanimated and it does exist (on JS thread) if function is worklet.
    (prop) => typeof prop === 'function' && prop.__workletHash !== undefined
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

export function useGesture(
  type: GestureType,
  config: Record<string, unknown>
): NativeGesture {
  const tag = useMemo(() => getNextHandlerTag(), []);

  const shouldUseReanimated =
    Reanimated !== undefined && hasWorkletEventHandlers(config);
  config.needsPointerData = shouldHandleTouchEvents(config);

  const {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerAnimatedEvent,
    onGestureHandlerTouchEvent,
  } = useGestureEvent(tag, config, shouldUseReanimated);

  // This should never happen, but since we don't want to call hooks conditionally,
  // we have to mark these as possibly undefined to make TypeScript happy.
  if (
    !onGestureHandlerStateChange ||
    !onGestureHandlerEvent ||
    !onGestureHandlerTouchEvent
  ) {
    throw new Error(tagMessage('Failed to create event handlers.'));
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
    // TODO: filter changes - passing functions (and possibly other types)
    // causes a native crash
    const animatedEvent = config.onGestureHandlerAnimatedEvent;
    config.onGestureHandlerAnimatedEvent = null;
    RNGestureHandlerModule.updateGestureHandler(tag, config);
    config.onGestureHandlerAnimatedEvent = animatedEvent;

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
    shouldUseReanimated,
    dispatchesAnimatedEvents:
      onGestureHandlerAnimatedEvent &&
      '__isNative' in onGestureHandlerAnimatedEvent,
  };
}
