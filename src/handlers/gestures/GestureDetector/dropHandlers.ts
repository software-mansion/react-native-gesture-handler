import { unregisterHandler } from '../../handlersRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import { scheduleFlushOperations } from '../../gestureHandlerCommon';
import { GestureConfigReference } from './types';

export function dropHandlers(preparedGesture: GestureConfigReference) {
  for (const handler of preparedGesture.gesturesToAttach) {
    RNGestureHandlerModule.dropGestureHandler(handler.handlerTag);

    unregisterHandler(handler.handlerTag, handler.config.testId);
  }

  scheduleFlushOperations();
}
