import { ActionType } from '../ActionType';

export type RNGestureHandlerModuleWeb = {
  handleSetJSResponder: (tag: number, blockNativeResponder: boolean) => void;
  handleClearJSResponder: () => void;
  createGestureHandler: (
    handlerName: string,
    handlerTag: number,
    config: Object
  ) => void;
  attachGestureHandler: (
    handlerTag: number,
    newView: any,
    propsRef: React.RefObject<unknown> | ActionType
  ) => void;
  attachGestureHandlerWeb: (
    handlerTag: number,
    newView: any,
    propsRef: React.RefObject<unknown>
  ) => void;
  updateGestureHandler: (handlerTag: number, newConfig: Object) => void;
  dropGestureHandler: (handlerTag: number) => void;
  getGestureHandlerNode: (handlerTag: number) => any;
  install: () => boolean;
  flushOperations: () => void;
};
