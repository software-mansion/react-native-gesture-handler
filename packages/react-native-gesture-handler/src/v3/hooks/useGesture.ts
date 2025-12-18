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
  const { defaultEventHandler, reanimatedEventHandler, animatedEventHandler } =
    useGestureCallbacks(tag, config);

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
    NativeProxy.createGestureHandler(type, tag, {});
  }

  const gesture = useMemo(
    () => ({
      tag,
      type,
      config,
      detectorCallbacks: {
        defaultEventHandler,
        animatedEventHandler,
        reanimatedEventHandler,
      },
      gestureRelations,
    }),
    [
      tag,
      type,
      config,
      defaultEventHandler,
      reanimatedEventHandler,
      animatedEventHandler,
      gestureRelations,
    ]
  );

  useEffect(() => {
    return () => {
      NativeProxy.dropGestureHandler(tag);
      scheduleFlushOperations();
    };
  }, [type, tag]);

  useEffect(() => {
    const preparedConfig = prepareConfigForNativeSide(type, config);
    NativeProxy.setGestureHandlerConfig(tag, preparedConfig);
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
