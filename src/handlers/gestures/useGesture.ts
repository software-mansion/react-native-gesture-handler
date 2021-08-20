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

  const result = React.useRef<GestureConfigReference>({
    config: gesture,
    callback: null,
    animatedEventHandler: null,
    animatedHandlers: null,
    firstExecution: true,
  });

  if (result.current.firstExecution) {
    gestureConfig.initialize();
  }

  function dropHandlers() {
    for (const handler of result.current.config) {
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
      let tag = ref.current?.handlerTag;
      if (tag === undefined) {
        tag = -1;
      }
      return tag;
    }
  }

  function attachHandlers() {
    if (!result.current.firstExecution) {
      gestureConfig.initialize();
    } else {
      result.current.firstExecution = false;
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
    result.current.config = gesture;
    result.current.callback?.();

    if (result.current.animatedHandlers) {
      result.current.animatedHandlers.value = (gesture.map(
        (g) => g.handlers
      ) as unknown) as HandlerCallbacks<Record<string, unknown>>[];
    }
  }

  function updateHandlers() {
    gestureConfig.prepare();

    for (let i = 0; i < gesture.length; i++) {
      const gst = result.current.config[i];

      gesture[i].handlerTag = gst.handlerTag;
      gesture[i].handlers.handlerTag = gst.handlerTag;
    }

    for (let i = 0; i < gesture.length; i++) {
      const gst = result.current.config[i];

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

    if (result.current.animatedHandlers) {
      result.current.animatedHandlers.value = (result.current.config.map(
        (g) => g.handlers
      ) as unknown) as HandlerCallbacks<Record<string, unknown>>[];
    }
  }

  function needsToReattach() {
    if (gesture.length !== result.current.config.length) {
      return true;
    } else {
      for (let i = 0; i < gesture.length; i++) {
        if (gesture[i].handlerName !== result.current.config[i].handlerName) {
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

  if (result.current?.callback) {
    if (needsToReattach()) {
      dropHandlers();
      attachHandlers();
    } else {
      updateHandlers();
    }
  }

  return result;
}
