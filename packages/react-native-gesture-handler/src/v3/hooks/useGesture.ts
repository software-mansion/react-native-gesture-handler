import { useEffect, useMemo } from 'react';

import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import {
  registerGesture,
  unregisterGesture,
} from '../../handlers/handlersRegistry';
import {
  scheduleFlushOperations,
  scheduleOperationToBeFlushed,
} from '../../handlers/utils';
import { tagMessage } from '../../utils';
import { NativeProxy } from '../NativeProxy';
import type {
  BaseGestureConfig,
  SingleGesture,
  SingleGestureName,
} from '../types';
import { useGestureCallbacks } from './useGestureCallbacks';
import {
  bindSharedValues,
  prepareConfigForNativeSide,
  prepareRelations,
  unbindSharedValues,
} from './utils';

export function useGesture<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData = THandlerData,
>(
  type: SingleGestureName,
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
): SingleGesture<TConfig, THandlerData, TExtendedHandlerData> {
  const handlerTag = useMemo(() => getNextHandlerTag(), []);
  const disableReanimated = useMemo(() => config.disableReanimated, []);

  if (config.disableReanimated !== disableReanimated) {
    throw new Error(
      tagMessage(
        'The "disableReanimated" property must not be changed after the handler is created.'
      )
    );
  }

  const { jsEventHandler, reanimatedEventHandler, animatedEventHandler } =
    useGestureCallbacks(handlerTag, config);

  if (config.shouldUseReanimatedDetector && !reanimatedEventHandler) {
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

  const gesture = useMemo(
    () => ({
      handlerTag,
      type,
      config,
      detectorCallbacks: {
        jsEventHandler,
        animatedEventHandler,
        reanimatedEventHandler,
      },
      gestureRelations,
    }),
    [
      handlerTag,
      type,
      config,
      jsEventHandler,
      reanimatedEventHandler,
      animatedEventHandler,
      gestureRelations,
    ]
  );

  useEffect(() => {
    NativeProxy.createGestureHandler(type, handlerTag, {});
    scheduleFlushOperations();

    return () => {
      NativeProxy.dropGestureHandler(handlerTag);
      scheduleFlushOperations();
    };
  }, [type, handlerTag]);

  useEffect(() => {
    const preparedConfig = prepareConfigForNativeSide(type, config);
    NativeProxy.setGestureHandlerConfig(handlerTag, preparedConfig);

    // Bind in the same batch, right after the full config is sent, so the
    // value the listeners send on attach always lands after it. Skip it if the
    // effect was cleaned up before the batch ran, the listeners would outlive
    // the unbind below.
    let cleanedUp = false;

    scheduleOperationToBeFlushed(() => {
      if (!cleanedUp) {
        bindSharedValues(config, handlerTag);
      }
    });
    scheduleFlushOperations();

    registerGesture(handlerTag, gesture);

    return () => {
      cleanedUp = true;

      unbindSharedValues(config, handlerTag);
      unregisterGesture(handlerTag);
    };
  }, [handlerTag, config, type, gesture]);

  return gesture;
}
