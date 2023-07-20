import { ActionType } from './ActionType';
import { isNewWebImplementationEnabled } from './EnableNewWebImplementation';

//GestureHandlers
import InteractionManager from './web/tools/InteractionManager';
import NodeManager from './web/tools/NodeManager';
import PanGestureHandler from './web/handlers/PanGestureHandler';
import TapGestureHandler from './web/handlers/TapGestureHandler';
import LongPressGestureHandler from './web/handlers/LongPressGestureHandler';
import PinchGestureHandler from './web/handlers/PinchGestureHandler';
import RotationGestureHandler from './web/handlers/RotationGestureHandler';
import FlingGestureHandler from './web/handlers/FlingGestureHandler';
import NativeViewGestureHandler from './web/handlers/NativeViewGestureHandler';
import ManualGestureHandler from './web/handlers/ManualGestureHandler';

//Hammer Handlers
import * as HammerNodeManager from './web_hammer/NodeManager';
import HammerNativeViewGestureHandler from './web_hammer/NativeViewGestureHandler';
import HammerPanGestureHandler from './web_hammer/PanGestureHandler';
import HammerTapGestureHandler from './web_hammer/TapGestureHandler';
import HammerLongPressGestureHandler from './web_hammer/LongPressGestureHandler';
import HammerPinchGestureHandler from './web_hammer/PinchGestureHandler';
import HammerRotationGestureHandler from './web_hammer/RotationGestureHandler';
import HammerFlingGestureHandler from './web_hammer/FlingGestureHandler';
import { Config } from './web/interfaces';

export const Gestures = {
  NativeViewGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  FlingGestureHandler,
  ManualGestureHandler,
};

export const HammerGestures = {
  NativeViewGestureHandler: HammerNativeViewGestureHandler,
  PanGestureHandler: HammerPanGestureHandler,
  TapGestureHandler: HammerTapGestureHandler,
  LongPressGestureHandler: HammerLongPressGestureHandler,
  PinchGestureHandler: HammerPinchGestureHandler,
  RotationGestureHandler: HammerRotationGestureHandler,
  FlingGestureHandler: HammerFlingGestureHandler,
};

export default {
  handleSetJSResponder(_tag: number, _blockNativeResponder: boolean) {
    // NO-OP
  },
  handleClearJSResponder() {
    // NO-OP
  },
  createGestureHandler<T>(
    handlerName: keyof typeof Gestures,
    handlerTag: number,
    config: T
  ) {
    if (isNewWebImplementationEnabled()) {
      if (!(handlerName in Gestures)) {
        throw new Error(
          `react-native-gesture-handler: ${handlerName} is not supported on web.`
        );
      }

      const GestureClass = Gestures[handlerName];
      NodeManager.createGestureHandler(handlerTag, new GestureClass());
      InteractionManager.getInstance().configureInteractions(
        NodeManager.getHandler(handlerTag),
        config as unknown as Config
      );
    } else {
      if (!(handlerName in HammerGestures)) {
        throw new Error(
          `react-native-gesture-handler: ${handlerName} is not supported on web.`
        );
      }

      // @ts-ignore If it doesn't exist, the error is thrown
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const GestureClass = HammerGestures[handlerName];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      HammerNodeManager.createGestureHandler(handlerTag, new GestureClass());
    }

    this.updateGestureHandler(handlerTag, config as unknown as Config);
  },
  attachGestureHandler(
    handlerTag: number,
    newView: number,
    _actionType: ActionType,
    propsRef: React.RefObject<unknown>
  ) {
    if (isNewWebImplementationEnabled()) {
      NodeManager.getHandler(handlerTag).init(newView, propsRef);
    } else {
      HammerNodeManager.getHandler(handlerTag).setView(newView, propsRef);
    }
  },
  updateGestureHandler(handlerTag: number, newConfig: Config) {
    if (isNewWebImplementationEnabled()) {
      NodeManager.getHandler(handlerTag).updateGestureConfig(newConfig);

      InteractionManager.getInstance().configureInteractions(
        NodeManager.getHandler(handlerTag),
        newConfig
      );
    } else {
      HammerNodeManager.getHandler(handlerTag).updateGestureConfig(newConfig);
    }
  },
  getGestureHandlerNode(handlerTag: number) {
    if (isNewWebImplementationEnabled()) {
      return NodeManager.getHandler(handlerTag);
    } else {
      return HammerNodeManager.getHandler(handlerTag);
    }
  },
  dropGestureHandler(handlerTag: number) {
    if (isNewWebImplementationEnabled()) {
      NodeManager.dropGestureHandler(handlerTag);
    } else {
      HammerNodeManager.dropGestureHandler(handlerTag);
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  flushOperations() {},
};
