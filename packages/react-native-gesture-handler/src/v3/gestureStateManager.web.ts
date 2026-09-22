import { State } from '../State';
import { tagMessage } from '../utils';
import type IGestureHandler from '../web/handlers/IGestureHandler';
import GestureHandlerOrchestrator from '../web/tools/GestureHandlerOrchestrator';
import NodeManager from '../web/tools/NodeManager';
import type { GestureStateManagerType } from './types/GestureStateManagerTypes';

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

    if (
      handler.tracker.trackedPointersCount === 0 ||
      (handler.state !== State.UNDETERMINED && handler.state !== State.BEGAN)
    ) {
      return;
    }

    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(handler);
    handler.begin();
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
