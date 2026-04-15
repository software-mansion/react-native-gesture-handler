import { MountRegistry } from '../../../mountRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import { unregisterHandler } from '../../handlersRegistry';
import { scheduleFlushOperations } from '../../utils';
import type AttachedGestureState from './types';

export function dropHandlers(preparedGesture: AttachedGestureState) {
  for (const handler of preparedGesture.attachedGestures) {
    RNGestureHandlerModule.dropGestureHandler(handler.handlerTag);

    unregisterHandler(handler.handlerTag, handler.config.testId);

    MountRegistry.gestureWillUnmount(handler);
  }

  scheduleFlushOperations();
}
