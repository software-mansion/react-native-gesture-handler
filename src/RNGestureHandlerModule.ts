import React from 'react';

import type { ActionType } from './ActionType';
import { isNewWebImplementationEnabled } from './EnableNewWebImplementation';
import { Gestures, HammerGestures } from './web/Gestures';
import type { Config } from './web/interfaces';
import InteractionManager from './web/tools/InteractionManager';
import NodeManager from './web/tools/NodeManager';
import * as HammerNodeManager from './web_hammer/NodeManager';
import { GestureHandlerWebDelegate } from './web/tools/GestureHandlerWebDelegate';

export default {
  handleSetJSResponder(tag: number, blockNativeResponder: boolean) {
    console.warn('handleSetJSResponder: ', tag, blockNativeResponder);
  },
  handleClearJSResponder() {
    console.warn('handleClearJSResponder: ');
  },
  createGestureHandler<T>(handlerName: string, handlerTag: number, config: T) {
    if (isNewWebImplementationEnabled()) {
      if (!(handlerName in Gestures)) {
        throw new Error(
          `react-native-gesture-handler: ${handlerName} is not supported on web.`
        );
      }

      const GestureClass = Gestures[handlerName as keyof typeof Gestures];
      NodeManager.createGestureHandler(
        handlerTag,
        new GestureClass(new GestureHandlerWebDelegate())
      );
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newView: any,
    propsRef: React.RefObject<unknown> | ActionType
  ) {
    if (
      !(newView instanceof HTMLElement || newView instanceof React.Component)
    ) {
      return;
    }

    if (isNewWebImplementationEnabled()) {
      //@ts-ignore Types should be HTMLElement or React.Component
      NodeManager.getHandler(handlerTag).init(newView, propsRef);
    } else {
      //@ts-ignore Types should be HTMLElement or React.Component
      HammerNodeManager.getHandler(handlerTag).setView(newView, propsRef);
    }
  },
  attachGestureHandlerWeb(
    handlerTag: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newView: any,
    propsRef: React.RefObject<unknown>
  ) {
    this.attachGestureHandler(handlerTag, newView, propsRef);
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  install() {},
};
