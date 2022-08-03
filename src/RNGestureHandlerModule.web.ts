import { ActionType } from './ActionType';

//GestureHandlers
import InteractionManager from './web/InteractionManager';
import NodeManager from './web/NodeManager';
import PanGestureHandler from './web/PanGestureHandler';
import TapGestureHandler from './web/TapGestureHandler';
import LongPressGestureHandler from './web/LongPressGestureHandler';
import PinchGestureHandler from './web/PinchGestureHandler';
import RotationGestureHandler from './web/RotationGestureHandler';
import FlingGestureHandler from './web/FlingGestureHandler';
import NativeViewGestureHandler from './web/NativeViewGestureHandler';

//Hammer Handlers
import * as HammerNodeManager from './web_hammer/NodeManager';
import HammerNativeViewGestureHandler from './web_hammer/NativeViewGestureHandler';
import HammerPanGestureHandler from './web_hammer/PanGestureHandler';
import HammerTapGestureHandler from './web_hammer/TapGestureHandler';
import HammerLongPressGestureHandler from './web_hammer/LongPressGestureHandler';
import HammerPinchGestureHandler from './web_hammer/PinchGestureHandler';
import HammerRotationGestureHandler from './web_hammer/RotationGestureHandler';
import HammerFlingGestureHandler from './web_hammer/FlingGestureHandler';

export const Gestures = {
  NativeViewGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  FlingGestureHandler,
};

export const HammerGestures = {
  NativeViewGestureHandler: HammerNativeViewGestureHandler,
  PanGestureHandler: HammerPanGestureHandler,
  TapGestureHandler: HammerTapGestureHandler,
  LongPressGestureHandler: HammerLongPressGestureHandler,
  PinchGestureHandler: HammerPinchGestureHandler,
  RotationGestureHandler: HammerRotationGestureHandler,
  FlingGestureHandle: HammerFlingGestureHandler,
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

    const GestureClass = Gestures[handlerName];
    NodeManager.createGestureHandler(handlerTag, new GestureClass());
    interactionManager.configureInteractions(
      NodeManager.getHandler(handlerTag),
      config
    );

    // if (!(handlerName in HammerGestures)) return;

    // const GestureClass = HammerGestures[handlerName];
    // HammerNodeManager.createGestureHandler(handlerTag, new GestureClass());

    this.updateGestureHandler(handlerTag, config);
  },
  attachGestureHandler(
    handlerTag: number,
    newView: number, //ref
    _actionType: ActionType,
    propsRef: React.RefObject<unknown>
  ) {
    NodeManager.getHandler(handlerTag).init(newView, propsRef);
    // HammerNodeManager.getHandler(handlerTag).setView(newView, propsRef);
  },
  updateGestureHandler(handlerTag: number, newConfig: any) {
    NodeManager.getHandler(handlerTag).updateGestureConfig(newConfig);
    // HammerNodeManager.getHandler(handlerTag).updateGestureConfig(newConfig);
  },
  getGestureHandlerNode(handlerTag: number) {
    return HammerNodeManager.getHandler(handlerTag);
  },
  dropGestureHandler(handlerTag: number) {
    NodeManager.dropGestureHandler(handlerTag);
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  flushOperations() {},
};
