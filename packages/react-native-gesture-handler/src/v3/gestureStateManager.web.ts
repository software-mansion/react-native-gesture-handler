import type IGestureHandler from '@swmansion/gesture-handler-dom-engine/src/handlers/IGestureHandler';
import GestureHandlerOrchestrator from '@swmansion/gesture-handler-dom-engine/src/tools/GestureHandlerOrchestrator';
import NodeManager from '@swmansion/gesture-handler-dom-engine/src/tools/NodeManager';

import { tagMessage } from '../utils';
import type { GestureStateManagerType } from './gestureStateManager';

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
