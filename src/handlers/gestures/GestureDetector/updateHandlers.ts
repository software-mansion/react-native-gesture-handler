import { GestureType, HandlerCallbacks } from '../gesture';
import { registerHandler } from '../../handlersRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import {
  filterConfig,
  scheduleFlushOperations,
} from '../../gestureHandlerCommon';
import { ComposedGesture } from '../gestureComposition';
import { ghQueueMicrotask } from '../../../ghQueueMicrotask';
import { AttachedGestureState } from './types';
import {
  extractGestureRelations,
  checkGestureCallbacksForWorklets,
  ALLOWED_PROPS,
} from './utils';

export function updateHandlers(
  preparedGesture: AttachedGestureState,
  gestureConfig: ComposedGesture | GestureType,
  newGestures: GestureType[]
) {
  gestureConfig.prepare();

  for (let i = 0; i < newGestures.length; i++) {
    const handler = preparedGesture.attachedGestures[i];
    checkGestureCallbacksForWorklets(handler);

    // only update handlerTag when it's actually different, it may be the same
    // if gesture config object is wrapped with useMemo
    if (newGestures[i].handlerTag !== handler.handlerTag) {
      newGestures[i].handlerTag = handler.handlerTag;
      newGestures[i].handlers.handlerTag = handler.handlerTag;
    }
  }

  // use queueMicrotask to extract handlerTags, because when it's ran, all refs should be updated
  // and handlerTags in BaseGesture references should be updated in the loop above (we need to wait
  // in case of external relations)
  ghQueueMicrotask(() => {
    if (!preparedGesture.isMounted) {
      return;
    }
    for (let i = 0; i < newGestures.length; i++) {
      const handler = preparedGesture.attachedGestures[i];

      handler.config = newGestures[i].config;
      handler.handlers = newGestures[i].handlers;

      RNGestureHandlerModule.updateGestureHandler(
        handler.handlerTag,
        filterConfig(
          handler.config,
          ALLOWED_PROPS,
          extractGestureRelations(handler)
        )
      );

      registerHandler(handler.handlerTag, handler, handler.config.testId);
    }

    if (preparedGesture.animatedHandlers) {
      const previousHandlersValue =
        preparedGesture.animatedHandlers.value ?? [];
      const newHandlersValue = preparedGesture.attachedGestures
        .filter((g) => g.shouldUseReanimated) // ignore gestures that shouldn't run on UI
        .map((g) => g.handlers) as unknown as HandlerCallbacks<
        Record<string, unknown>
      >[];

      // if amount of gesture configs changes, we need to update the callbacks in shared value
      let shouldUpdateSharedValue =
        previousHandlersValue.length !== newHandlersValue.length;

      if (!shouldUpdateSharedValue) {
        // if the amount is the same, we need to check if any of the configs inside has changed
        for (let i = 0; i < newHandlersValue.length; i++) {
          if (
            // we can use the `gestureId` prop as it's unique for every config instance
            newHandlersValue[i].gestureId !== previousHandlersValue[i].gestureId
          ) {
            shouldUpdateSharedValue = true;
            break;
          }
        }
      }

      if (shouldUpdateSharedValue) {
        preparedGesture.animatedHandlers.value = newHandlersValue;
      }
    }

    scheduleFlushOperations();
  });
}
