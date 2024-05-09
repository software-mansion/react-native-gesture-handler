import React from 'react';
import { GestureType, HandlerCallbacks } from '../gesture';
import { registerHandler } from '../../handlersRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import {
  filterConfig,
  scheduleFlushOperations,
} from '../../gestureHandlerCommon';
import { ComposedGesture } from '../gestureComposition';
import { ActionType } from '../../../ActionType';
import { Platform } from 'react-native';
import type RNGestureHandlerModuleWeb from '../../../RNGestureHandlerModule.web';
import { ghQueueMicrotask } from '../../../ghQueueMicrotask';
import { GestureConfigReference, WebEventHandler } from './types';
import {
  extractValidHandlerTags,
  checkGestureCallbacksForWorklets,
  ALLOWED_PROPS,
} from './utils';

interface AttachHandlersConfig {
  preparedGesture: GestureConfigReference;
  gestureConfig: ComposedGesture | GestureType;
  gestures: GestureType[];
  viewTag: number;
  webEventHandlersRef: React.RefObject<WebEventHandler>;
  mountedRef: React.RefObject<boolean>;
}

export function attachHandlers({
  preparedGesture,
  gestureConfig,
  gestures,
  viewTag,
  webEventHandlersRef,
  mountedRef,
}: AttachHandlersConfig) {
  if (!preparedGesture.firstExecution) {
    gestureConfig.initialize();
  } else {
    preparedGesture.firstExecution = false;
  }

  // use queueMicrotask to extract handlerTags, because all refs should be initialized
  // when it's ran
  ghQueueMicrotask(() => {
    if (!mountedRef.current) {
      return;
    }
    gestureConfig.prepare();
  });

  for (const handler of gestures) {
    checkGestureCallbacksForWorklets(handler);
    RNGestureHandlerModule.createGestureHandler(
      handler.handlerName,
      handler.handlerTag,
      filterConfig(handler.config, ALLOWED_PROPS)
    );

    registerHandler(handler.handlerTag, handler, handler.config.testId);
  }

  // use queueMicrotask to extract handlerTags, because all refs should be initialized
  // when it's ran
  ghQueueMicrotask(() => {
    if (!mountedRef.current) {
      return;
    }
    for (const handler of gestures) {
      let requireToFail: number[] = [];
      if (handler.config.requireToFail) {
        requireToFail = extractValidHandlerTags(handler.config.requireToFail);
      }

      let simultaneousWith: number[] = [];
      if (handler.config.simultaneousWith) {
        simultaneousWith = extractValidHandlerTags(
          handler.config.simultaneousWith
        );
      }

      let blocksHandlers: number[] = [];
      if (handler.config.blocksHandlers) {
        blocksHandlers = extractValidHandlerTags(handler.config.blocksHandlers);
      }

      RNGestureHandlerModule.updateGestureHandler(
        handler.handlerTag,
        filterConfig(handler.config, ALLOWED_PROPS, {
          simultaneousHandlers: simultaneousWith,
          waitFor: requireToFail,
          blocksHandlers: blocksHandlers,
        })
      );
    }

    scheduleFlushOperations();
  });

  preparedGesture.gesturesToAttach = gestures;

  for (const gesture of preparedGesture.gesturesToAttach) {
    const actionType = gesture.shouldUseReanimated
      ? ActionType.REANIMATED_WORKLET
      : ActionType.JS_FUNCTION_NEW_API;

    if (Platform.OS === 'web') {
      (
        RNGestureHandlerModule.attachGestureHandler as typeof RNGestureHandlerModuleWeb.attachGestureHandler
      )(
        gesture.handlerTag,
        viewTag,
        ActionType.JS_FUNCTION_OLD_API, // ignored on web
        webEventHandlersRef
      );
    } else {
      RNGestureHandlerModule.attachGestureHandler(
        gesture.handlerTag,
        viewTag,
        actionType
      );
    }
  }

  if (preparedGesture.animatedHandlers) {
    const isAnimatedGesture = (g: GestureType) => g.shouldUseReanimated;

    preparedGesture.animatedHandlers.value = gestures
      .filter(isAnimatedGesture)
      .map((g) => g.handlers) as unknown as HandlerCallbacks<
      Record<string, unknown>
    >[];
  }
}
