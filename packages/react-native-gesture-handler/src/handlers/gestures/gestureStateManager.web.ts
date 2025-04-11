import NodeManager from '../../web/tools/NodeManager';
import { GestureStateManagerType } from './gestureStateManager';

export const GestureStateManager = {
  create(handlerTag: number): GestureStateManagerType {
    return {
      begin: () => {
        NodeManager.getHandler(handlerTag).begin();
      },

      activate: () => {
        NodeManager.getHandler(handlerTag).activate(true);
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
