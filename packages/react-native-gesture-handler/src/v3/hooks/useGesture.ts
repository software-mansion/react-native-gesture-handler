import { useEffect, useMemo, useRef } from 'react';
import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { useGestureCallbacks } from './useGestureCallbacks';
import {
  prepareConfig,
  prepareRelations,
  bindSharedValues,
  unbindSharedValues,
  prepareConfigForNativeSide,
} from './utils';
import { tagMessage } from '../../utils';
import { BaseGestureConfig, SingleGesture, SingleGestureName } from '../types';
import { scheduleFlushOperations } from '../../handlers/utils';
import {
  registerGesture,
  unregisterGesture,
} from '../../handlers/handlersRegistry';

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

  // This has to be done ASAP as other hooks depend `shouldUseReanimatedDetector`.
  prepareConfig(config);

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
    config.shouldUseReanimatedDetector &&
    (!onReanimatedStateChange ||
      !onReanimatedUpdateEvent ||
      !onReanimatedTouchEvent)
  ) {
    throw new Error(tagMessage('Failed to create reanimated event handlers.'));
  }

  const gestureRelations = useMemo(
    () =>
      prepareRelations(
        {
          simultaneousWith: config.simultaneousWith,
          requireToFail: config.requireToFail,
          block: config.block,
        },
        tag
      ),
    [tag, config.simultaneousWith, config.requireToFail, config.block]
  );

  const currentGestureRef = useRef({ type: '', tag: -1 });
  if (
    currentGestureRef.current.tag !== tag ||
    currentGestureRef.current.type !== (type as string)
  ) {
    currentGestureRef.current = { type, tag };
    RNGestureHandlerModule.createGestureHandler(type, tag, {});
    // It's possible that this can cause errors about handler not being created when attempting to mount NativeDetector
    scheduleFlushOperations();
  }

  const gesture = useMemo(
    () => ({
      tag,
      type,
      config,
      detectorCallbacks: {
        onGestureHandlerStateChange,
        onGestureHandlerEvent,
        onGestureHandlerTouchEvent,
        onReanimatedStateChange,
        onReanimatedUpdateEvent,
        onReanimatedTouchEvent,
        onGestureHandlerAnimatedEvent,
      },
      gestureRelations,
    }),
    [
      tag,
      type,
      config,
      onGestureHandlerStateChange,
      onGestureHandlerEvent,
      onGestureHandlerTouchEvent,
      onReanimatedStateChange,
      onReanimatedUpdateEvent,
      onReanimatedTouchEvent,
      onGestureHandlerAnimatedEvent,
      gestureRelations,
    ]
  );

  useEffect(() => {
    return () => {
      RNGestureHandlerModule.dropGestureHandler(tag);
      scheduleFlushOperations();
    };
  }, [type, tag]);

  useEffect(() => {
    const preparedConfig = prepareConfigForNativeSide(type, config);
    RNGestureHandlerModule.setGestureHandlerConfig(tag, preparedConfig);
    scheduleFlushOperations();

    bindSharedValues(config, tag);

    registerGesture(tag, gesture);

    return () => {
      unbindSharedValues(config, tag);
      unregisterGesture(tag);
    };
  }, [tag, config, type, gesture]);

  return gesture;
}
