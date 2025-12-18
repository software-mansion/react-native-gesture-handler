import { useEffect, useMemo, useRef } from 'react';
import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
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
import { NativeProxy } from '../NativeProxy';

export function useGesture<THandlerData, TConfig>(
  type: SingleGestureName,
  config: BaseGestureConfig<THandlerData, TConfig>
): SingleGesture<THandlerData, TConfig> {
  const handlerTag = useMemo(() => getNextHandlerTag(), []);
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
    onGestureHandlerEvent,
    onGestureHandlerReanimatedEvent,
    onGestureHandlerAnimatedEvent,
  } = useGestureCallbacks(handlerTag, config);

  if (config.shouldUseReanimatedDetector && !onGestureHandlerReanimatedEvent) {
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
        handlerTag
      ),
    [handlerTag, config.simultaneousWith, config.requireToFail, config.block]
  );

  const currentGestureRef = useRef({ type: '', handlerTag: -1 });
  if (
    currentGestureRef.current.handlerTag !== handlerTag ||
    currentGestureRef.current.type !== (type as string)
  ) {
    currentGestureRef.current = { type, handlerTag };
    NativeProxy.createGestureHandler(type, handlerTag, {});
  }

  const gesture = useMemo(
    () => ({
      handlerTag,
      type,
      config,
      detectorCallbacks: {
        onGestureHandlerEvent,
        onGestureHandlerAnimatedEvent,
        onGestureHandlerReanimatedEvent,
      },
      gestureRelations,
    }),
    [
      handlerTag,
      type,
      config,
      onGestureHandlerEvent,
      onGestureHandlerReanimatedEvent,
      onGestureHandlerAnimatedEvent,
      gestureRelations,
    ]
  );

  useEffect(() => {
    return () => {
      NativeProxy.dropGestureHandler(handlerTag);
      scheduleFlushOperations();
    };
  }, [type, handlerTag]);

  useEffect(() => {
    const preparedConfig = prepareConfigForNativeSide(type, config);
    NativeProxy.setGestureHandlerConfig(handlerTag, preparedConfig);
    scheduleFlushOperations();

    bindSharedValues(config, handlerTag);
    registerGesture(handlerTag, gesture);

    return () => {
      unbindSharedValues(config, handlerTag);
      unregisterGesture(handlerTag);
    };
  }, [handlerTag, config, type, gesture]);

  return gesture;
}
