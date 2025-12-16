import { State } from '../State';
import NodeManager from '../web/tools/NodeManager';

export const begin = (handlerTag: number): void => {
  'worklet';
  NodeManager.getHandler(handlerTag).begin();
};

export const activate = (handlerTag: number): void => {
  'worklet';
  const handler = NodeManager.getHandler(handlerTag);

  // Force going from UNDETERMINED to ACTIVE through BEGAN to preserve
  // the correct state transition flow.
  if (handler.state === State.UNDETERMINED) {
    handler.begin();
  }

  handler.activate(true);
};

export const fail = (handlerTag: number): void => {
  'worklet';
  NodeManager.getHandler(handlerTag).fail();
};

export const end = (handlerTag: number): void => {
  'worklet';
  NodeManager.getHandler(handlerTag).end();
};
