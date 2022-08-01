import { ActionType } from './ActionType';
import InteractionManager from './web/InteractionManager';
import NodeManager from './web/NodeManager';
import PanGestureHandler from './web/PanGestureHandler';
import TapGestureHandler from './web/TapGestureHandler';
import LongPressGestureHandler from './web/LongPressGestureHandler';
import PinchGestureHandler from './web/PinchGestureHandler';
import RotationGestureHandler from './web/RotationGestureHandler';
import FlingGestureHandler from './web/FlingGestureHandler';
import NativeViewGestureHandler from './web/NativeViewGestureHandler';

export const Gestures = {
  NativeViewGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  FlingGestureHandler,
};

const interactionManager = new InteractionManager();

export default {
  // Direction,
  handleSetJSResponder(tag: number, blockNativeResponder: boolean) {
    console.warn('handleSetJSResponder: ', tag, blockNativeResponder);
  },
  handleClearJSResponder() {
    console.warn('handleClearJSResponder: ');
  },
  createGestureHandler<T>(
    handlerName: keyof typeof Gestures,
    handlerTag: number,
    config: T
  ) {
    if (!(handlerName in Gestures)) return;

    // console.log(handlerName);

    const GestureClass = Gestures[handlerName];
    NodeManager.createGestureHandler(handlerTag, new GestureClass());
    interactionManager.configureInteractions(
      NodeManager.getHandler(handlerTag),
      config
    );

    this.updateGestureHandler(handlerTag, config);
  },
  attachGestureHandler(
    handlerTag: number,
    newView: number, //ref
    _actionType: ActionType,
    propsRef: React.RefObject<unknown>
  ) {
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
