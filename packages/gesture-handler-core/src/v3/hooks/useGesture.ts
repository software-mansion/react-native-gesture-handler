import { useEffect, useMemo } from 'react';

import { getNextHandlerTag } from '../../handlers/getNextHandlerTag';
import {
  registerGesture,
  unregisterGesture,
} from '../../handlers/handlersRegistry';
import { tagMessage } from '../../utils';
import type { CoreRuntime } from '../platform/Port';
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
  runtime: CoreRuntime,
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

  // TODO: Call only necessary hooks depending on which callbacks are defined (?)
  const { jsEventHandler, reanimatedEventHandler, animatedEventHandler } =
    useGestureCallbacks(runtime, handlerTag, config);

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
    runtime.port.proxy.createGestureHandler(type, handlerTag, {});
    runtime.port.proxy.flush();

    return () => {
      runtime.port.proxy.dropGestureHandler(handlerTag);
      runtime.port.proxy.flush();
    };
  }, [runtime, type, handlerTag]);

  useEffect(() => {
    const preparedConfig = prepareConfigForNativeSide(type, config);
    runtime.port.proxy.setGestureHandlerConfig(handlerTag, preparedConfig);
    runtime.port.proxy.flush();

    bindSharedValues(runtime, config, handlerTag);
    registerGesture(handlerTag, gesture);

    return () => {
      unbindSharedValues(runtime, config, handlerTag);
      unregisterGesture(handlerTag);
    };
  }, [runtime, handlerTag, config, type, gesture]);

  return gesture;
}
