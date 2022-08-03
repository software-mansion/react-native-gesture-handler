import { ActionType } from './ActionType';
import { Direction } from './web/constants';
import FlingGestureHandler from './web/handlers/FlingGestureHandler';
import LongPressGestureHandler from './web/handlers/LongPressGestureHandler';
import NativeViewGestureHandler from './web/handlers/NativeViewGestureHandler';
// import * as NodeManager from './web/NodeManager';
import NodeManager from './web/NodeManager';
import PanGestureHandler from './web/handlers/PanGestureHandler';
import PinchGestureHandler from './web/handlers/PinchGestureHandler';
import RotationGestureHandler from './web/handlers/RotationGestureHandler';
import TapGestureHandler from './web/handlers/TapGestureHandler';

export const Gestures = {
  PanGestureHandler,
  RotationGestureHandler,
  PinchGestureHandler,
  TapGestureHandler,
  NativeViewGestureHandler,
  LongPressGestureHandler,
  FlingGestureHandler,
  // ForceTouchGestureHandler,
};

export default {
  Direction,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleSetJSResponder() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleClearJSResponder() {},
  createGestureHandler<T>(
    handlerName: keyof typeof Gestures,
    handlerTag: number,
    config: T
  ) {
    //TODO(TS) extends config
    if (!(handlerName in Gestures))
      throw new Error(
        `react-native-gesture-handler: ${handlerName} is not supported on macos.`
      );
    const GestureClass = Gestures[handlerName];
    NodeManager.createGestureHandler(handlerTag, new GestureClass());
    this.updateGestureHandler(handlerTag, config);
  },
  attachGestureHandler(
    handlerTag: number,
    newView: number,
    _actionType: ActionType,
    propsRef: React.RefObject<unknown>
  ) {
    // NodeManager.getHandler(handlerTag).setView(newView, propsRef);
    NodeManager.getHandler(handlerTag).init(newView, propsRef);
  },
  updateGestureHandler(handlerTag: number, newConfig: any) {
    NodeManager.getHandler(handlerTag).updateGestureConfig(newConfig);
  },
  getGestureHandlerNode(handlerTag: number) {
    return NodeManager.getHandler(handlerTag);
  },
  dropGestureHandler(handlerTag: number) {
    NodeManager.dropGestureHandler(handlerTag);
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  flushOperations() {},
};
