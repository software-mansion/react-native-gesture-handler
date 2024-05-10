import { unregisterHandler } from '../../handlersRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import { scheduleFlushOperations } from '../../gestureHandlerCommon';
import { AttachedGestureState } from './types';

export function dropHandlers(preparedGesture: AttachedGestureState) {
  for (const handler of preparedGesture.attachedGestures) {
    RNGestureHandlerModule.dropGestureHandler(handler.handlerTag);

    unregisterHandler(handler.handlerTag, handler.config.testId);
  }

  scheduleFlushOperations();
}
