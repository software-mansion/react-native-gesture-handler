import NodeManager from '@swmansion/gesture-handler-dom-engine/src/tools/NodeManager';

import { State } from '../../State';
import type { GestureStateManagerType } from './gestureStateManager';

export const GestureStateManager = {
  create(handlerTag: number): GestureStateManagerType {
    return {
      handlerTag,

      begin: () => {
        NodeManager.getHandler(handlerTag).begin();
      },

      activate: () => {
        const handler = NodeManager.getHandler(handlerTag);

        // Force going from UNDETERMINED to ACTIVE through BEGAN to preserve
        // the correct state transition flow.
        if (handler.state === State.UNDETERMINED) {
          handler.begin();
        }

        handler.activate(true);
      },

      fail: () => {
        NodeManager.getHandler(handlerTag).fail();
      },

      end: () => {
        NodeManager.getHandler(handlerTag).end();
      },
    };
  },
};
