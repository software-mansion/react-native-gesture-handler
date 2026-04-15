import type { AttachedGestureState } from './types';
import { MountRegistry } from '../../../mountRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import { scheduleFlushOperations } from '../../utils';
import { unregisterHandler } from '../../handlersRegistry';

export function dropHandlers(preparedGesture: AttachedGestureState) {
  for (const handler of preparedGesture.attachedGestures) {
    RNGestureHandlerModule.dropGestureHandler(handler.handlerTag);

    unregisterHandler(handler.handlerTag, handler.config.testId);

    MountRegistry.gestureWillUnmount(handler);
  }

  scheduleFlushOperations();
}
