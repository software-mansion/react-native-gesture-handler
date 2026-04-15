import GestureHandlerOrchestrator from '../web/tools/GestureHandlerOrchestrator';
import type { GestureStateManagerType } from './gestureStateManager';
import type IGestureHandler from '../web/handlers/IGestureHandler';
import NodeManager from '../web/tools/NodeManager';
import { tagMessage } from '../utils';

function ensureHandlerAttached(handler: IGestureHandler) {
  if (!handler.attached) {
    throw new Error(
      tagMessage(
        'Manually handled gesture had not been assigned to any detector'
      )
    );
  }
}

export const GestureStateManager: GestureStateManagerType = {
  activate(handlerTag: number): void {
    'worklet';
    const handler = NodeManager.getHandler(handlerTag);
    ensureHandlerAttached(handler);

    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(handler);
    handler.activate(true);
  },

  fail(handlerTag: number): void {
    'worklet';
    const handler = NodeManager.getHandler(handlerTag);
    ensureHandlerAttached(handler);

    handler.fail();
  },

  deactivate(handlerTag: number): void {
    'worklet';
    const handler = NodeManager.getHandler(handlerTag);
    ensureHandlerAttached(handler);

    handler.end();
  },
};
