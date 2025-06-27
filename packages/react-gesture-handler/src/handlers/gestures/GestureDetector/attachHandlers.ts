import React from 'react';
import { GestureType } from '../gesture';
import { registerHandler } from '../../handlersRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import { filterConfig, scheduleFlushOperations } from '../../utils';
import { ComposedGesture } from '../gestureComposition';
import { ghQueueMicrotask } from '../../../ghQueueMicrotask';
import { AttachedGestureState, WebEventHandler } from './types';
import {
  extractGestureRelations,
  checkGestureCallbacksForWorklets,
  ALLOWED_PROPS,
} from './utils';
import { MountRegistry } from '../../../mountRegistry';
import { Gestures } from '../../../web/Gestures';

interface AttachHandlersConfig {
  preparedGesture: AttachedGestureState;
  gestureConfig: ComposedGesture | GestureType;
  gesturesToAttach: GestureType[];
  viewTag: number;
  webEventHandlersRef: React.RefObject<WebEventHandler>;
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
      handler.handlerName as keyof typeof Gestures,
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
      RNGestureHandlerModule.updateGestureHandler(
        handler.handlerTag,
        // @ts-ignore works
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
    console.log(viewTag);
    RNGestureHandlerModule.attachGestureHandler(
      gesture.handlerTag,
      viewTag,
      webEventHandlersRef
    );

    MountRegistry.gestureWillMount(gesture);
  }

  preparedGesture.attachedGestures = gesturesToAttach;
}
