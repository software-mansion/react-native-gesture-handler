import { State } from '../State';
import NodeManager from '../web/tools/NodeManager';

export const GestureStateManager = {
  begin(handlerTag: number): void {
    'worklet';
    NodeManager.getHandler(handlerTag).begin();
  },

  activate(handlerTag: number): void {
    'worklet';
    const handler = NodeManager.getHandler(handlerTag);
    // Force going from UNDETERMINED to ACTIVE through BEGAN to preserve
    // the correct state transition flow.
    if (handler.state === State.UNDETERMINED) {
      handler.begin();
    }

    handler.activate(true);
  },

  fail(handlerTag: number): void {
    'worklet';
    NodeManager.getHandler(handlerTag).fail();
  },

  end(handlerTag: number): void {
    'worklet';
    NodeManager.getHandler(handlerTag).end();
  },
};
