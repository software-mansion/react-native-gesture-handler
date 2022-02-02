var _Reanimated$default$c, _Reanimated$default;

import React, { useEffect, useRef } from 'react';
import { BaseGesture, CALLBACK_TYPE } from './gesture';
import { Reanimated } from './reanimatedWrapper';
import { registerHandler, unregisterHandler } from '../handlersRegistry';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { baseGestureHandlerWithMonitorProps, filterConfig, findNodeHandle } from '../gestureHandlerCommon';
import { GestureStateManager } from './gestureStateManager';
import { flingGestureHandlerProps } from '../FlingGestureHandler';
import { forceTouchGestureHandlerProps } from '../ForceTouchGestureHandler';
import { longPressGestureHandlerProps } from '../LongPressGestureHandler';
import { panGestureHandlerProps, panGestureHandlerCustomNativeProps } from '../PanGestureHandler';
import { tapGestureHandlerProps } from '../TapGestureHandler';
import { State } from '../../State';
import { EventType } from '../../EventType';
const ALLOWED_PROPS = [...baseGestureHandlerWithMonitorProps, ...tapGestureHandlerProps, ...panGestureHandlerProps, ...panGestureHandlerCustomNativeProps, ...longPressGestureHandlerProps, ...forceTouchGestureHandlerProps, ...flingGestureHandlerProps];

function convertToHandlerTag(ref) {
  if (typeof ref === 'number') {
    return ref;
  } else if (ref instanceof BaseGesture) {
    return ref.handlerTag;
  } else {
    var _ref$current$handlerT, _ref$current;

    // @ts-ignore in this case it should be a ref either to gesture object or
    // a gesture handler component, in both cases handlerTag property exists
    return (_ref$current$handlerT = (_ref$current = ref.current) === null || _ref$current === void 0 ? void 0 : _ref$current.handlerTag) !== null && _ref$current$handlerT !== void 0 ? _ref$current$handlerT : -1;
  }
}

function extractValidHandlerTags(interactionGroup) {
  var _interactionGroup$map, _interactionGroup$map2;

  return (_interactionGroup$map = interactionGroup === null || interactionGroup === void 0 ? void 0 : (_interactionGroup$map2 = interactionGroup.map(convertToHandlerTag)) === null || _interactionGroup$map2 === void 0 ? void 0 : _interactionGroup$map2.filter(tag => tag > 0)) !== null && _interactionGroup$map !== void 0 ? _interactionGroup$map : [];
}

function dropHandlers(preparedGesture) {
  for (const handler of preparedGesture.config) {
    RNGestureHandlerModule.dropGestureHandler(handler.handlerTag);
    unregisterHandler(handler.handlerTag);
  }
}

function attachHandlers({
  preparedGesture,
  gestureConfig,
  gesture,
  viewTag,
  useAnimated
}) {
  if (!preparedGesture.firstExecution) {
    gestureConfig === null || gestureConfig === void 0 ? void 0 : gestureConfig.initialize();
  } else {
    preparedGesture.firstExecution = false;
  } // use setImmediate to extract handlerTags, because all refs should be initialized
  // when it's ran


  setImmediate(() => {
    gestureConfig === null || gestureConfig === void 0 ? void 0 : gestureConfig.prepare();
  });

  for (const handler of gesture) {
    RNGestureHandlerModule.createGestureHandler(handler.handlerName, handler.handlerTag, filterConfig(handler.config, ALLOWED_PROPS));
    registerHandler(handler.handlerTag, handler); // use setImmediate to extract handlerTags, because all refs should be initialized
    // when it's ran

    setImmediate(() => {
      let requireToFail = [];

      if (handler.config.requireToFail) {
        requireToFail = extractValidHandlerTags(handler.config.requireToFail);
      }

      let simultaneousWith = [];

      if (handler.config.simultaneousWith) {
        simultaneousWith = extractValidHandlerTags(handler.config.simultaneousWith);
      }

      RNGestureHandlerModule.updateGestureHandler(handler.handlerTag, filterConfig(handler.config, ALLOWED_PROPS, {
        simultaneousHandlers: simultaneousWith,
        waitFor: requireToFail
      }));
    });
  }

  preparedGesture.config = gesture;

  for (const gesture of preparedGesture.config) {
    RNGestureHandlerModule.attachGestureHandler(gesture.handlerTag, viewTag, !useAnimated // send direct events when using animatedGesture, device events otherwise
    );
  }

  if (preparedGesture.animatedHandlers) {
    preparedGesture.animatedHandlers.value = gesture.map(g => g.handlers);
  }
}

function updateHandlers(preparedGesture, gestureConfig, gesture) {
  gestureConfig === null || gestureConfig === void 0 ? void 0 : gestureConfig.prepare();

  for (let i = 0; i < gesture.length; i++) {
    const handler = preparedGesture.config[i];
    gesture[i].handlerTag = handler.handlerTag;
    gesture[i].handlers.handlerTag = handler.handlerTag;
  } // use setImmediate to extract handlerTags, because when it's ran, all refs should be updated
  // and handlerTags in BaseGesture references should be updated in the loop above (we need to wait
  // in case of external relations)


  setImmediate(() => {
    for (let i = 0; i < gesture.length; i++) {
      const handler = preparedGesture.config[i];
      handler.config = gesture[i].config;
      handler.handlers = gesture[i].handlers;
      handler.handlers.handlerTag = handler.handlerTag;
      const requireToFail = extractValidHandlerTags(handler.config.requireToFail);
      const simultaneousWith = extractValidHandlerTags(handler.config.simultaneousWith);
      RNGestureHandlerModule.updateGestureHandler(handler.handlerTag, filterConfig(handler.config, ALLOWED_PROPS, {
        simultaneousHandlers: simultaneousWith,
        waitFor: requireToFail
      }));
      registerHandler(handler.handlerTag, handler);
    }

    if (preparedGesture.animatedHandlers) {
      preparedGesture.animatedHandlers.value = preparedGesture.config.map(g => g.handlers);
    }
  });
}

function needsToReattach(preparedGesture, gesture) {
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

function useAnimatedGesture(preparedGesture) {
  if (!Reanimated) {
    return;
  }

  function isStateChangeEvent(event) {
    'worklet'; // @ts-ignore Yes, the oldState prop is missing on GestureTouchEvent, that's the point

    return event.oldState != null;
  }

  function isTouchEvent(event) {
    'worklet';

    return event.eventType != null;
  }

  function getHandler(type, gesture) {
    'worklet';

    switch (type) {
      case CALLBACK_TYPE.BEGAN:
        return gesture.onBegin;

      case CALLBACK_TYPE.START:
        return gesture.onStart;

      case CALLBACK_TYPE.UPDATE:
        return gesture.onUpdate;

      case CALLBACK_TYPE.CHANGE:
        return gesture.onChange;

      case CALLBACK_TYPE.END:
        return gesture.onEnd;

      case CALLBACK_TYPE.FINALIZE:
        return gesture.onFinalize;

      case CALLBACK_TYPE.TOUCHES_DOWN:
        return gesture.onTouchesDown;

      case CALLBACK_TYPE.TOUCHES_MOVE:
        return gesture.onTouchesMove;

      case CALLBACK_TYPE.TOUCHES_UP:
        return gesture.onTouchesUp;

      case CALLBACK_TYPE.TOUCHES_CANCELLED:
        return gesture.onTouchesCancelled;
    }
  }

  function touchEventTypeToCallbackType(eventType) {
    'worklet';

    switch (eventType) {
      case EventType.TOUCHES_DOWN:
        return CALLBACK_TYPE.TOUCHES_DOWN;

      case EventType.TOUCHES_MOVE:
        return CALLBACK_TYPE.TOUCHES_MOVE;

      case EventType.TOUCHES_UP:
        return CALLBACK_TYPE.TOUCHES_UP;

      case EventType.TOUCHES_CANCELLED:
        return CALLBACK_TYPE.TOUCHES_CANCELLED;
    }

    return CALLBACK_TYPE.UNDEFINED;
  }

  function runWorklet(type, gesture, event, ...args) {
    'worklet';

    const handler = getHandler(type, gesture);

    if (gesture.isWorklet[type]) {
      // @ts-ignore Logic below makes sure the correct event is send to the
      // correct handler.
      handler === null || handler === void 0 ? void 0 : handler(event, ...args);
    } else if (handler) {
      console.warn('Animated gesture callback must be a worklet');
    }
  } // Hooks are called conditionally, but the condition is whether the
  // react-native-reanimated is installed, which shouldn't change while running
  // eslint-disable-next-line react-hooks/rules-of-hooks


  const sharedHandlersCallbacks = Reanimated.useSharedValue(null); // eslint-disable-next-line react-hooks/rules-of-hooks

  const lastUpdateEvent = Reanimated.useSharedValue([]); // not every gesture needs a state controller, init them lazily

  const stateControllers = [];

  const callback = event => {
    'worklet';

    const currentCallback = sharedHandlersCallbacks.value;

    if (!currentCallback) {
      return;
    }

    for (let i = 0; i < currentCallback.length; i++) {
      const gesture = currentCallback[i];

      if (event.handlerTag === gesture.handlerTag) {
        if (isStateChangeEvent(event)) {
          if (event.oldState === State.UNDETERMINED && event.state === State.BEGAN) {
            runWorklet(CALLBACK_TYPE.BEGAN, gesture, event);
          } else if ((event.oldState === State.BEGAN || event.oldState === State.UNDETERMINED) && event.state === State.ACTIVE) {
            runWorklet(CALLBACK_TYPE.START, gesture, event);
            lastUpdateEvent.value[gesture.handlerTag] = undefined;
          } else if (event.oldState !== event.state && event.state === State.END) {
            if (event.oldState === State.ACTIVE) {
              runWorklet(CALLBACK_TYPE.END, gesture, event, true);
            }

            runWorklet(CALLBACK_TYPE.FINALIZE, gesture, event, true);
          } else if ((event.state === State.FAILED || event.state === State.CANCELLED) && event.state !== event.oldState) {
            if (event.oldState === State.ACTIVE) {
              runWorklet(CALLBACK_TYPE.END, gesture, event, false);
            }

            runWorklet(CALLBACK_TYPE.FINALIZE, gesture, event, false);
          }
        } else if (isTouchEvent(event)) {
          if (!stateControllers[i]) {
            stateControllers[i] = GestureStateManager.create(event.handlerTag);
          }

          if (event.eventType !== EventType.UNDETERMINED) {
            runWorklet(touchEventTypeToCallbackType(event.eventType), gesture, event, stateControllers[i]);
          }
        } else {
          runWorklet(CALLBACK_TYPE.UPDATE, gesture, event);

          if (gesture.onChange && gesture.changeEventCalculator) {
            var _gesture$changeEventC;

            runWorklet(CALLBACK_TYPE.CHANGE, gesture, (_gesture$changeEventC = gesture.changeEventCalculator) === null || _gesture$changeEventC === void 0 ? void 0 : _gesture$changeEventC.call(gesture, event, lastUpdateEvent.value[gesture.handlerTag]));
            lastUpdateEvent.value[gesture.handlerTag] = event;
          }
        }
      }
    }
  }; // eslint-disable-next-line react-hooks/rules-of-hooks


  const event = Reanimated.useEvent(callback, ['onGestureHandlerStateChange', 'onGestureHandlerEvent'], true);
  preparedGesture.animatedEventHandler = event;
  preparedGesture.animatedHandlers = sharedHandlersCallbacks;
}

export const GestureDetector = props => {
  var _gestureConfig$toGest, _gestureConfig$toGest2;

  const gestureConfig = props.gesture;
  const gesture = (_gestureConfig$toGest = gestureConfig === null || gestureConfig === void 0 ? void 0 : (_gestureConfig$toGest2 = gestureConfig.toGestureArray) === null || _gestureConfig$toGest2 === void 0 ? void 0 : _gestureConfig$toGest2.call(gestureConfig)) !== null && _gestureConfig$toGest !== void 0 ? _gestureConfig$toGest : [];
  const useAnimated = gesture.find(gesture => gesture.handlers.isWorklet.reduce((prev, current) => prev || current)) != null;
  const viewRef = useRef(null);
  const firstRenderRef = useRef(true);
  const preparedGesture = React.useRef({
    config: gesture,
    animatedEventHandler: null,
    animatedHandlers: null,
    firstExecution: true,
    useAnimated: useAnimated
  }).current;

  if (useAnimated !== preparedGesture.useAnimated) {
    throw new Error('You cannot change whether you are using gesture or animatedGesture while the app is running');
  }

  if (preparedGesture.firstExecution) {
    var _gestureConfig$initia;

    gestureConfig === null || gestureConfig === void 0 ? void 0 : (_gestureConfig$initia = gestureConfig.initialize) === null || _gestureConfig$initia === void 0 ? void 0 : _gestureConfig$initia.call(gestureConfig);
  }

  if (useAnimated) {
    // Whether animatedGesture or gesture is used shouldn't change
    // during while an app is running
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedGesture(preparedGesture);
  }

  useEffect(() => {
    firstRenderRef.current = true;
    const viewTag = findNodeHandle(viewRef.current);
    attachHandlers({
      preparedGesture,
      gestureConfig,
      gesture,
      viewTag,
      useAnimated
    });
    return () => {
      dropHandlers(preparedGesture);
    };
  }, []);
  useEffect(() => {
    if (!firstRenderRef.current) {
      const viewTag = findNodeHandle(viewRef.current);

      if (needsToReattach(preparedGesture, gesture)) {
        dropHandlers(preparedGesture);
        attachHandlers({
          preparedGesture,
          gestureConfig,
          gesture,
          viewTag,
          useAnimated
        });
      } else {
        updateHandlers(preparedGesture, gestureConfig, gesture);
      }
    } else {
      firstRenderRef.current = false;
    }
  }, [props]);

  if (useAnimated) {
    return /*#__PURE__*/React.createElement(AnimatedWrap, {
      ref: viewRef,
      onGestureHandlerEvent: preparedGesture.animatedEventHandler
    }, props.children);
  } else {
    return /*#__PURE__*/React.createElement(Wrap, {
      ref: viewRef
    }, props.children);
  }
};

class Wrap extends React.Component {
  render() {
    // I don't think that fighting with types over such a simple function is worth it
    // The only thing it does is add 'collapsable: false' to the child component
    // to make sure it is in the native view hierarchy so the detector can find
    // correct viewTag to attach to.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child = React.Children.only(this.props.children);
    return /*#__PURE__*/React.cloneElement(child, {
      collapsable: false
    }, // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    child.props.children);
  }

}

const AnimatedWrap = (_Reanimated$default$c = Reanimated === null || Reanimated === void 0 ? void 0 : (_Reanimated$default = Reanimated.default) === null || _Reanimated$default === void 0 ? void 0 : _Reanimated$default.createAnimatedComponent(Wrap)) !== null && _Reanimated$default$c !== void 0 ? _Reanimated$default$c : Wrap;
//# sourceMappingURL=GestureDetector.js.map