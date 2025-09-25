import { GestureType, HandlerCallbacks } from '../gesture';
import { registerHandler } from '../../handlersRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import { filterConfig, scheduleFlushOperations } from '../../utils';
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

    // Only update handlerTag when it's actually different, it may be the same
    // if gesture config object is wrapped with useMemo
    if (newGestures[i].handlerTag !== handler.handlerTag) {
      newGestures[i].handlerTag = handler.handlerTag;
      newGestures[i].handlers.handlerTag = handler.handlerTag;
    }
  }

  // Store attached gestures to avoid crash when gestures changed after queueing micro task
  const attachedGestures = preparedGesture.attachedGestures;

  // Use queueMicrotask to extract handlerTags, because when it's ran, all refs should be updated
  // and handlerTags in BaseGesture references should be updated in the loop above (we need to wait
  // in case of external relations)
  ghQueueMicrotask(() => {
    if (!preparedGesture.isMounted) {
      return;
    }

    // Stop if attached gestures changed after queueing micro task
    if (attachedGestures !== preparedGesture.attachedGestures) {
      return;
    }

    // If amount of gesture configs changes, we need to update the callbacks in shared value
    let shouldUpdateSharedValueIfUsed =
      attachedGestures.length !== newGestures.length;

    for (let i = 0; i < newGestures.length; i++) {
      const handler = attachedGestures[i];

      // If the gestureId is different (gesture isn't wrapped with useMemo or its dependencies changed),
      // we need to update the shared value, assuming the gesture runs on UI thread or the thread changed
      if (
        handler.handlers.gestureId !== newGestures[i].handlers.gestureId &&
        (newGestures[i].shouldUseReanimated || handler.shouldUseReanimated)
      ) {
        shouldUpdateSharedValueIfUsed = true;
      }

      handler.config = newGestures[i].config;
      handler.handlers = newGestures[i].handlers;

      RNGestureHandlerModule.setGestureHandlerConfig(
        handler.handlerTag,
        filterConfig(
          handler.config,
          ALLOWED_PROPS,
          extractGestureRelations(handler)
        )
      );

      RNGestureHandlerModule.configureRelations(
        handler.handlerTag,
        extractGestureRelations(handler)
      );

      registerHandler(handler.handlerTag, handler, handler.config.testId);
    }

    if (preparedGesture.animatedHandlers && shouldUpdateSharedValueIfUsed) {
      const newHandlersValue = attachedGestures
        .filter((g) => g.shouldUseReanimated) // Ignore gestures that shouldn't run on UI
        .map((g) => g.handlers) as unknown as HandlerCallbacks<
        Record<string, unknown>
      >[];

      preparedGesture.animatedHandlers.value = newHandlersValue;
    }

    scheduleFlushOperations();
  });
}
