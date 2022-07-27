import { ActionType } from './ActionType';
import InteractionManager from './web/InteractionManager';
import NodeManager from './web/NodeManager';
import PanGestureHandler from './web/PanGestureHandler';
import TapGestureHandler from './web/TapGestureHandler';
import LongPressGestureHandler from './web/LongPressGestureHandler';

export const Gestures = {
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
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

    this.updateGestureHandler(handlerTag, config);
  },
  attachGestureHandler(
    handlerTag: number,
    newView: number, //ref
    _actionType: ActionType,
    propsRef: React.RefObject<unknown>
  ) {
    //TODO remove if
    //This if prevents throwing error on attaching handler to ScrollView
    if (handlerTag !== 1) {
      NodeManager.getHandler(handlerTag).init(newView, propsRef);
    }
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
