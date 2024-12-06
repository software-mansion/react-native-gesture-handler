import React from 'react';

import type { ActionType } from './ActionType';
import { Gestures } from './web/Gestures';
import type { Config } from './web/interfaces';
import InteractionManager from './web/tools/InteractionManager';
import NodeManager from './web/tools/NodeManager';
import { GestureHandlerWebDelegate } from './web/tools/GestureHandlerWebDelegate';

// init method is called inside attachGestureHandler function. However, this function may
// fail when received view is not valid HTML element. On the other hand, dropGestureHandler
// will be called even if attach failed, which will result in crash.
//
// We use this flag to check whether or not dropGestureHandler should be called.
let shouldPreventDrop = false;

export default {
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
    if (!(handlerName in Gestures)) {
      throw new Error(
        `react-native-gesture-handler: ${handlerName} is not supported on web.`
      );
    }

    const GestureClass = Gestures[handlerName];
    NodeManager.createGestureHandler(
      handlerTag,
      new GestureClass(new GestureHandlerWebDelegate())
    );
    InteractionManager.getInstance().configureInteractions(
      NodeManager.getHandler(handlerTag),
      config as unknown as Config
    );
    this.updateGestureHandler(handlerTag, config as unknown as Config);
  },
  attachGestureHandler(
    handlerTag: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newView: any,
    _actionType: ActionType,
    propsRef: React.RefObject<unknown>
  ) {
    if (!(newView instanceof Element || newView instanceof React.Component)) {
      shouldPreventDrop = true;

      const handler = NodeManager.getHandler(handlerTag);

      const handlerName = handler.constructor.name;

      throw new Error(
        `${handlerName} with tag ${handlerTag} received child that is not valid HTML element.`
      );
    }

    // @ts-ignore Types should be HTMLElement or React.Component
    NodeManager.getHandler(handlerTag).init(newView, propsRef);
  },
  updateGestureHandler(handlerTag: number, newConfig: Config) {
    NodeManager.getHandler(handlerTag).updateGestureConfig(newConfig);

    InteractionManager.getInstance().configureInteractions(
      NodeManager.getHandler(handlerTag),
      newConfig
    );
  },
  getGestureHandlerNode(handlerTag: number) {
    return NodeManager.getHandler(handlerTag);
  },
  dropGestureHandler(handlerTag: number) {
    if (shouldPreventDrop) {
      return;
    }

    NodeManager.dropGestureHandler(handlerTag);
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  flushOperations() {},
};
