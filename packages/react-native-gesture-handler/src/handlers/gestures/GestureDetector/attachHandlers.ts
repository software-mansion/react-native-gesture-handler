import React from 'react';
import { GestureType, HandlerCallbacks } from '../gesture';
import { registerHandler } from '../../handlersRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import { filterConfig, scheduleFlushOperations } from '../../utils';
import { ComposedGesture } from '../gestureComposition';
import { ActionType } from '../../../ActionType';
import { Platform } from 'react-native';
import type RNGestureHandlerModuleWeb from '../../../RNGestureHandlerModule.web';
import { ghQueueMicrotask } from '../../../ghQueueMicrotask';
import { AttachedGestureState } from './types';
import {
  extractGestureRelations,
  checkGestureCallbacksForWorklets,
  ALLOWED_PROPS,
} from './utils';
import { MountRegistry } from '../../../mountRegistry';
import { PropsRef } from '../../../web/interfaces';

interface AttachHandlersConfig {
  preparedGesture: AttachedGestureState;
  gestureConfig: ComposedGesture | GestureType;
  gesturesToAttach: GestureType[];
  viewTag: number;
  webEventHandlersRef: React.RefObject<PropsRef>;
}

export function attachHandlers({
  preparedGesture,
  gestureConfig,
  gesturesToAttach,
  viewTag,
  webEventHandlersRef,
}: AttachHandlersConfig) {
  gestureConfig.initialize();

  // Use queueMicrotask to extract handlerTags, because all refs should be initialized
  // when it's ran
  ghQueueMicrotask(() => {
    if (!preparedGesture.isMounted) {
      return;
    }
    gestureConfig.prepare();
  });

  for (const handler of gesturesToAttach) {
    checkGestureCallbacksForWorklets(handler);
    RNGestureHandlerModule.createGestureHandler(
      handler.handlerName,
      handler.handlerTag,
      filterConfig(handler.config, ALLOWED_PROPS)
    );

    registerHandler(handler.handlerTag, handler, handler.config.testId);
  }

  // Use queueMicrotask to extract handlerTags, because all refs should be initialized
  // when it's ran
  ghQueueMicrotask(() => {
    if (!preparedGesture.isMounted) {
      return;
    }
    for (const handler of gesturesToAttach) {
      RNGestureHandlerModule.setGestureHandlerConfig(
        handler.handlerTag,
        filterConfig(
          handler.config,
          ALLOWED_PROPS,
          extractGestureRelations(handler)
        )
      );
    }

    scheduleFlushOperations();
  });

  for (const gesture of gesturesToAttach) {
    const actionType = gesture.shouldUseReanimated
      ? ActionType.REANIMATED_WORKLET
      : ActionType.JS_FUNCTION_NEW_API;

    if (Platform.OS === 'web') {
      (
        RNGestureHandlerModule.attachGestureHandler as typeof RNGestureHandlerModuleWeb.attachGestureHandler
      )(
        gesture.handlerTag,
        viewTag,
        ActionType.JS_FUNCTION_OLD_API, // Ignored on web
        webEventHandlersRef
      );
    } else {
      RNGestureHandlerModule.attachGestureHandler(
        gesture.handlerTag,
        viewTag,
        actionType
      );
    }

    MountRegistry.gestureWillMount(gesture);
  }

  preparedGesture.attachedGestures = gesturesToAttach;

  if (preparedGesture.animatedHandlers) {
    const isAnimatedGesture = (g: GestureType) => g.shouldUseReanimated;

    preparedGesture.animatedHandlers.value = gesturesToAttach
      .filter(isAnimatedGesture)
      .map((g) => g.handlers) as unknown as HandlerCallbacks<
      Record<string, unknown>
    >[];
  }
}
