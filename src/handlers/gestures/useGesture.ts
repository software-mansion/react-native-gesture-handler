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
import Animated from 'react-native-reanimated';
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
  animatedEventHandler: any;
  animatedHandlers: Animated.SharedValue<
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
  });

  if (preparedGesture.current.firstExecution) {
    gestureConfig.initialize();
  }

  function dropHandlers() {
    for (const handler of preparedGesture.current.config) {
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
    if (!preparedGesture.current.firstExecution) {
      gestureConfig.initialize();
    } else {
      preparedGesture.current.firstExecution = false;
    }

    for (const gst of gesture) {
      RNGestureHandlerModule.createGestureHandler(
        gst.handlerName,
        gst.handlerTag,
        filterConfig(gst.config, ALLOWED_PROPS)
      );

      registerHandler(gst.handlerTag, gst);

      setImmediate(() => {
        gestureConfig.prepare();

        let requireToFail: number[] = [];
        if (gst.config.requireToFail) {
          requireToFail = gst.config.requireToFail
            .map(convertToHandlerTag)
            .filter((tag) => tag > 0);
        }

        let simultaneousWith: number[] = [];
        if (gst.config.simultaneousWith) {
          simultaneousWith = gst.config.simultaneousWith
            .map(convertToHandlerTag)
            .filter((tag) => tag > 0);
        }

        RNGestureHandlerModule.updateGestureHandler(
          gst.handlerTag,
          filterConfig(gst.config, ALLOWED_PROPS, {
            simultaneousHandlers: simultaneousWith,
            waitFor: requireToFail,
          })
        );
      });
    }
    preparedGesture.current.config = gesture;
    preparedGesture.current.callback?.();

    if (preparedGesture.current.animatedHandlers) {
      preparedGesture.current.animatedHandlers.value = (gesture.map(
        (g) => g.handlers
      ) as unknown) as HandlerCallbacks<Record<string, unknown>>[];
    }
  }

  function updateHandlers() {
    gestureConfig.prepare();

    for (let i = 0; i < gesture.length; i++) {
      const gst = preparedGesture.current.config[i];

      gesture[i].handlerTag = gst.handlerTag;
      gesture[i].handlers.handlerTag = gst.handlerTag;
    }

    for (let i = 0; i < gesture.length; i++) {
      const gst = preparedGesture.current.config[i];

      gst.config = gesture[i].config;
      gst.handlers = gesture[i].handlers;
      gst.handlers.handlerTag = gst.handlerTag;

      let requireToFail: number[] = [];
      if (gst.config.requireToFail) {
        requireToFail = gst.config.requireToFail
          .map(convertToHandlerTag)
          .filter((tag) => tag > 0);
      }

      let simultaneousWith: number[] = [];
      if (gst.config.simultaneousWith) {
        simultaneousWith = gst.config.simultaneousWith
          .map(convertToHandlerTag)
          .filter((tag) => tag > 0);
      }

      RNGestureHandlerModule.updateGestureHandler(
        gst.handlerTag,
        filterConfig(gst.config, ALLOWED_PROPS, {
          simultaneousHandlers: simultaneousWith,
          waitFor: requireToFail,
        })
      );

      registerHandler(gst.handlerTag, gst);
    }

    if (preparedGesture.current.animatedHandlers) {
      preparedGesture.current.animatedHandlers.value = (preparedGesture.current.config.map(
        (g) => g.handlers
      ) as unknown) as HandlerCallbacks<Record<string, unknown>>[];
    }
  }

  function needsToReattach() {
    if (gesture.length !== preparedGesture.current.config.length) {
      return true;
    } else {
      for (let i = 0; i < gesture.length; i++) {
        if (
          gesture[i].handlerName !==
          preparedGesture.current.config[i].handlerName
        ) {
          return true;
        }
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

  if (preparedGesture.current?.callback) {
    if (needsToReattach()) {
      dropHandlers();
      attachHandlers();
    } else {
      updateHandlers();
    }
  }

  return preparedGesture;
}
