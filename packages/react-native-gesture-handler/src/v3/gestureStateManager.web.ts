import { State } from '../State';
import { tagMessage } from '../utils';
import IGestureHandler from '../web/handlers/IGestureHandler';
import GestureHandlerOrchestrator from '../web/tools/GestureHandlerOrchestrator';
import NodeManager from '../web/tools/NodeManager';
import { GestureStateManagerType } from './gestureStateManager';

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
  begin(handlerTag: number): void {
    'worklet';
    const handler = NodeManager.getHandler(handlerTag);
    ensureHandlerAttached(handler);

    GestureHandlerOrchestrator.instance.recordHandlerIfNotPresent(handler);
    handler.begin();
  },

  activate(handlerTag: number): void {
    'worklet';
    const handler = NodeManager.getHandler(handlerTag);
    ensureHandlerAttached(handler);
    // Force going from UNDETERMINED to ACTIVE through BEGAN to preserve
    // the correct state transition flow.
    if (handler.state === State.UNDETERMINED) {
      handler.begin();
    }

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
