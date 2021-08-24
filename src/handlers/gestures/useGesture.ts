import React from 'react';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import {
  BaseGesture,
  GestureRef,
  GestureType,
  HandlerCallbacks,
  InteractionBuilder,
} from './gesture';
import { registerHandler, unregisterHandler } from '../handlersRegistry';
import { SharedValue } from './reanimatedWrapper';
import {
  baseGestureHandlerWithMonitorProps,
  filterConfig,
} from '../gestureHandlerCommon';
import { tapGestureHandlerProps } from '../TapGestureHandler';
import {
  panGestureHandlerProps,
  panGestureHandlerCustomNativeProps,
} from '../PanGestureHandler';
import { longPressGestureHandlerProps } from '../LongPressGestureHandler';
import { forceTouchGestureHandlerProps } from '../ForceTouchGestureHandler';
import { flingGestureHandlerProps } from '../FlingGestureHandler';

const ALLOWED_PROPS = [
  ...baseGestureHandlerWithMonitorProps,
  ...tapGestureHandlerProps,
  ...panGestureHandlerProps,
  ...panGestureHandlerCustomNativeProps,
  ...longPressGestureHandlerProps,
  ...forceTouchGestureHandlerProps,
  ...flingGestureHandlerProps,
];

export type GestureConfigReference = {
  config: GestureType[];
  callback: null | (() => void);
  animatedEventHandler: unknown;
  animatedHandlers: SharedValue<
    HandlerCallbacks<Record<string, unknown>>[] | null
  > | null;
  firstExecution: boolean;
};

export function useGesture(gestureConfig: InteractionBuilder | GestureType) {
  const gesture = gestureConfig.configure();

  const preparedGesture = React.useRef<GestureConfigReference>({
    config: gesture,
    callback: null,
    animatedEventHandler: null,
    animatedHandlers: null,
    firstExecution: true,
  }).current;

  if (preparedGesture.firstExecution) {
    gestureConfig.initialize();
  }

  function dropHandlers() {
    for (const handler of preparedGesture.config) {
      RNGestureHandlerModule.dropGestureHandler(handler.handlerTag);

      unregisterHandler(handler.handlerTag);
    }
  }

  function convertToHandlerTag(ref: GestureRef): number {
    if (typeof ref === 'number') {
      return ref;
    } else if (ref instanceof BaseGesture) {
      return ref.handlerTag;
    } else {
      return ref.current?.handlerTag ?? -1;
    }
  }

  function attachHandlers() {
    if (!preparedGesture.firstExecution) {
      gestureConfig.initialize();
    } else {
      preparedGesture.firstExecution = false;
    }

    for (const handler of gesture) {
      RNGestureHandlerModule.createGestureHandler(
        handler.handlerName,
        handler.handlerTag,
        filterConfig(handler.config, ALLOWED_PROPS)
      );

      registerHandler(handler.handlerTag, handler);

      setImmediate(() => {
        gestureConfig.prepare();

        let requireToFail: number[] = [];
        if (handler.config.requireToFail) {
          requireToFail = handler.config.requireToFail
            .map(convertToHandlerTag)
            .filter((tag) => tag > 0);
        }

        let simultaneousWith: number[] = [];
        if (handler.config.simultaneousWith) {
          simultaneousWith = handler.config.simultaneousWith
            .map(convertToHandlerTag)
            .filter((tag) => tag > 0);
        }

        RNGestureHandlerModule.updateGestureHandler(
          handler.handlerTag,
          filterConfig(handler.config, ALLOWED_PROPS, {
            simultaneousHandlers: simultaneousWith,
            waitFor: requireToFail,
          })
        );
      });
    }
    preparedGesture.config = gesture;
    preparedGesture.callback?.();

    if (preparedGesture.animatedHandlers) {
      preparedGesture.animatedHandlers.value = (gesture.map(
        (g) => g.handlers
      ) as unknown) as HandlerCallbacks<Record<string, unknown>>[];
    }
  }

  function updateHandlers() {
    gestureConfig.prepare();

    for (let i = 0; i < gesture.length; i++) {
      const handler = preparedGesture.config[i];

      gesture[i].handlerTag = handler.handlerTag;
      gesture[i].handlers.handlerTag = handler.handlerTag;
    }

    for (let i = 0; i < gesture.length; i++) {
      const handler = preparedGesture.config[i];

      handler.config = gesture[i].config;
      handler.handlers = gesture[i].handlers;
      handler.handlers.handlerTag = handler.handlerTag;

      const requireToFail =
        handler.config.requireToFail
          ?.map(convertToHandlerTag)
          ?.filter((tag) => tag > 0) ?? [];

      const simultaneousWith =
        handler.config.simultaneousWith
          ?.map(convertToHandlerTag)
          ?.filter((tag) => tag > 0) ?? [];

      RNGestureHandlerModule.updateGestureHandler(
        handler.handlerTag,
        filterConfig(handler.config, ALLOWED_PROPS, {
          simultaneousHandlers: simultaneousWith,
          waitFor: requireToFail,
        })
      );

      registerHandler(handler.handlerTag, handler);
    }

    if (preparedGesture.animatedHandlers) {
      preparedGesture.animatedHandlers.value = (preparedGesture.config.map(
        (g) => g.handlers
      ) as unknown) as HandlerCallbacks<Record<string, unknown>>[];
    }
  }

  function needsToReattach() {
    if (gesture.length !== preparedGesture.config.length) {
      return true;
    }
    for (let i = 0; i < gesture.length; i++) {
      if (gesture[i].handlerName !== preparedGesture.config[i].handlerName) {
        return true;
      }
    }

    return false;
  }

  React.useEffect(() => {
    attachHandlers();

    return () => {
      dropHandlers();
    };
  }, []);

  if (preparedGesture?.callback) {
    if (needsToReattach()) {
      dropHandlers();
      attachHandlers();
    } else {
      updateHandlers();
    }
  }

  return preparedGesture;
}
