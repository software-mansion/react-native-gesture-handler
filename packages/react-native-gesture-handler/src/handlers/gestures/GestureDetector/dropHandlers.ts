import { unregisterHandler } from '../../handlersRegistry';
import RNGestureHandlerModule from '../../../RNGestureHandlerModule';
import { scheduleFlushOperations } from '../../utils';
import { AttachedGestureState } from './types';
import { MountRegistry } from '../../../mountRegistry';

export function dropHandlers(preparedGesture: AttachedGestureState) {
  for (const handler of preparedGesture.attachedGestures) {
    RNGestureHandlerModule.dropGestureHandler(handler.handlerTag);

    unregisterHandler(handler.handlerTag, handler.config.testId);

    MountRegistry.gestureWillUnmount(handler);
  }

  scheduleFlushOperations();
}
