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
import { Platform } from 'react-native';
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
  const {
    onGestureHandlerEvent,
    onReanimatedEvent,
    onGestureHandlerAnimatedEvent,
  } = useGestureCallbacks(tag, config);

  if (config.shouldUseReanimatedDetector && !onReanimatedEvent) {
    throw new Error(tagMessage('Failed to create reanimated event handlers.'));
  }

  const gestureRelations = useMemo(() => {
    const rel = prepareRelations(
      {
        simultaneousWith: config.simultaneousWith,
        requireToFail: config.requireToFail,
        block: config.block,
      },
      tag
    );
    return rel;
  }, [tag, config.simultaneousWith, config.requireToFail, config.block]);

  const currentGestureRef = useRef({ type: '', tag: -1 });
  if (
    currentGestureRef.current.tag !== tag ||
    currentGestureRef.current.type !== (type as string)
  ) {
    currentGestureRef.current = { type, tag };
    NativeProxy.createGestureHandler(type, tag, {});
  }

  useEffect(() => {
    return () => {
      NativeProxy.dropGestureHandler(tag);
    };
  }, [type, tag]);

  useEffect(() => {
    const preparedConfig = prepareConfigForNativeSide(type, config);
    NativeProxy.setGestureHandlerConfig(tag, preparedConfig);

    bindSharedValues(config, tag);

    return () => {
      unbindSharedValues(config, tag);
    };
  }, [tag, config, type]);

  return useMemo(
    (): SingleGesture<THandlerData, TConfig> => ({
      tag,
      type,
      config,
      detectorCallbacks: {
        onGestureHandlerStateChange: onGestureHandlerEvent,
        onGestureHandlerEvent: onGestureHandlerEvent,
        onGestureHandlerTouchEvent: onGestureHandlerEvent,
        onGestureHandlerAnimatedEvent,
        // On web, we're triggering Reanimated callbacks ourselves, based on the type.
        // To handle this properly, we need to provide all three callbacks, so we set
        // all three to the Reanimated event handler.
        // On native, Reanimated handles routing internally based on the event names
        // passed to the useEvent hook. We only need to pass it once, so that Reanimated
        // can setup its internal listeners.
        ...(Platform.OS === 'web'
          ? {
              onReanimatedUpdateEvent: onReanimatedEvent,
              onReanimatedStateChange: onReanimatedEvent,
              onReanimatedTouchEvent: onReanimatedEvent,
            }
          : {
              onReanimatedUpdateEvent: onReanimatedEvent,
              onReanimatedStateChange: undefined,
              onReanimatedTouchEvent: undefined,
            }),
      },
      gestureRelations,
    }),
    [
      tag,
      type,
      config,
      onGestureHandlerEvent,
      onReanimatedEvent,
      onGestureHandlerAnimatedEvent,
      gestureRelations,
    ]
  );
}
