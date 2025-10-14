import { useEffect, useMemo } from 'react';
import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { useGestureCallbacks } from './useGestureCallbacks';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import {
  prepareConfig,
  isAnimatedEvent,
  shouldHandleTouchEvents,
} from './utils';
import { tagMessage } from '../../utils';
import { BaseGestureConfig, SingleGesture, SingleGestureName } from '../types';
import {
  bindSharedValues,
  hasWorkletEventHandlers,
  unbindSharedValues,
} from './utils/reanimatedUtils';
import { prepareRelations } from './utils/relationUtils';

export function useGesture<THandlerData, TConfig>(
  type: SingleGestureName,
  config: BaseGestureConfig<THandlerData, TConfig>
): SingleGesture<THandlerData, TConfig> {
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
  config.dispatchesAnimatedEvents = isAnimatedEvent(config.onUpdate);

  if (config.dispatchesAnimatedEvents && config.shouldUseReanimated) {
    throw new Error(
      tagMessage(
        `${type}: You cannot use Animated.Event together with callbacks running on the UI thread. Either remove Animated.Event from onUpdate, or set runOnJS property to true on the gesture.`
      )
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

  const gestureRelations = prepareRelations(config, tag);

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
    const preparedConfig = prepareConfig(type, config);
    RNGestureHandlerModule.setGestureHandlerConfig(tag, preparedConfig);
    RNGestureHandlerModule.flushOperations();

    bindSharedValues(config, tag);

    return () => {
      unbindSharedValues(config, tag);
    };
  }, [tag, config]);

  return {
    tag,
    type,
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
    gestureRelations,
  };
}
