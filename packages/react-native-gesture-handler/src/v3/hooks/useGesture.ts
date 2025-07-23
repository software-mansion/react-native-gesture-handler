import { useEffect, useMemo } from 'react';
import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { useGestureEvent } from './useGestureEvent';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
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
  onGestureHandlerEvent: (event: any) => void;
  onGestureHandlerTouchEvent: (event: any) => void;
  onGestureHandlerAnimatedEvent: undefined | AnimatedEvent;
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
    const animatedEvent = config.onUpdate;
    config.onUpdate = null;
    RNGestureHandlerModule.updateGestureHandler(tag, config);
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
    shouldUseReanimated,
    dispatchesAnimatedEvents:
      !!onGestureHandlerAnimatedEvent &&
      '__isNative' in onGestureHandlerAnimatedEvent,
  };
}
