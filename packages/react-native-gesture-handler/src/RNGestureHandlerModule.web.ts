import React from 'react';

import type { ActionType } from './ActionType';
import type { GestureRelations } from './v3/types';
import { Gestures } from './web/Gestures';
import type { Config, HostDetector, PropsRef } from './web/interfaces';
import { GestureHandlerWebDelegate } from './web/tools/GestureHandlerWebDelegate';
import InteractionManager from './web/tools/InteractionManager';
import NodeManager from './web/tools/NodeManager';

// init method is called inside attachGestureHandler function. However, this function may
// fail when received view is not valid HTML element. On the other hand, dropGestureHandler
// will be called even if attach failed, which will result in crash.
//
// We use this flag to check whether or not dropGestureHandler should be called.
let shouldPreventDrop = false;

export default {
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
    this.setGestureHandlerConfig(handlerTag, config as unknown as Config);
  },
  attachGestureHandler(
    handlerTag: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newView: any,
    actionType: ActionType,
    propsRef: React.RefObject<PropsRef>,
    hostDetector?: HostDetector | null
  ) {
    if (!(newView instanceof Element || newView instanceof React.Component)) {
      shouldPreventDrop = true;

      const handler = NodeManager.getHandler(handlerTag);

      const handlerName = handler.constructor.name;

      throw new Error(
        `${handlerName} with tag ${handlerTag} received child that is not valid HTML element.`
      );
    }

    NodeManager.getHandler(handlerTag).init(
      // @ts-expect-error view ref type differs between web and native
      newView,
      propsRef,
      actionType,
      hostDetector ?? null
    );
  },
  detachGestureHandler(handlerTag: number, hostDetector?: HostDetector | null) {
    if (shouldPreventDrop) {
      shouldPreventDrop = false;
      return;
    }

    NodeManager.detachGestureHandler(handlerTag, hostDetector);
  },
  setGestureHandlerConfig(handlerTag: number, newConfig: Config) {
    NodeManager.getHandler(handlerTag).setGestureConfig(newConfig);
  },
  updateGestureHandlerConfig(handlerTag: number, newConfig: Partial<Config>) {
    NodeManager.getHandler(handlerTag).updateGestureConfig(newConfig);
  },
  getGestureHandlerNode(handlerTag: number) {
    return NodeManager.getHandler(handlerTag);
  },
  dropGestureHandler(handlerTag: number) {
    if (shouldPreventDrop) {
      shouldPreventDrop = false;
      return;
    }

    NodeManager.dropGestureHandler(handlerTag);
  },
  configureRelations(handlerTag: number, relations: GestureRelations) {
    if (!NodeManager.hasHandler(handlerTag)) {
      return;
    }
    InteractionManager.instance.configureInteractions(
      NodeManager.getHandler(handlerTag),
      relations
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  flushOperations() {},
  installUIRuntimeBindings() {
    // No-op on web
    return true;
  },
};
