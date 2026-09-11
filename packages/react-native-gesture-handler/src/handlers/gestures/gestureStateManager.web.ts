import NodeManager from '../../web/tools/NodeManager';

export interface GestureStateManagerType {
  begin: () => void;
  activate: () => void;
  fail: () => void;
  end: () => void;
  /** @internal */
  handlerTag: number;
}

export const GestureStateManager = {
  create(handlerTag: number): GestureStateManagerType {
    return {
      handlerTag,

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
