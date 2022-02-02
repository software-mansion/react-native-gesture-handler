"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GestureDetector = void 0;

var _react = _interopRequireWildcard(require("react"));

var _gesture = require("./gesture");

var _reanimatedWrapper = require("./reanimatedWrapper");

var _handlersRegistry = require("../handlersRegistry");

var _RNGestureHandlerModule = _interopRequireDefault(require("../../RNGestureHandlerModule"));

var _gestureHandlerCommon = require("../gestureHandlerCommon");

var _gestureStateManager = require("./gestureStateManager");

var _FlingGestureHandler = require("../FlingGestureHandler");

var _ForceTouchGestureHandler = require("../ForceTouchGestureHandler");

var _LongPressGestureHandler = require("../LongPressGestureHandler");

var _PanGestureHandler = require("../PanGestureHandler");

var _TapGestureHandler = require("../TapGestureHandler");

var _State = require("../../State");

var _EventType = require("../../EventType");

var _Reanimated$default$c, _Reanimated$default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const ALLOWED_PROPS = [..._gestureHandlerCommon.baseGestureHandlerWithMonitorProps, ..._TapGestureHandler.tapGestureHandlerProps, ..._PanGestureHandler.panGestureHandlerProps, ..._PanGestureHandler.panGestureHandlerCustomNativeProps, ..._LongPressGestureHandler.longPressGestureHandlerProps, ..._ForceTouchGestureHandler.forceTouchGestureHandlerProps, ..._FlingGestureHandler.flingGestureHandlerProps];

function convertToHandlerTag(ref) {
  if (typeof ref === 'number') {
    return ref;
  } else if (ref instanceof _gesture.BaseGesture) {
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
    _RNGestureHandlerModule.default.dropGestureHandler(handler.handlerTag);

    (0, _handlersRegistry.unregisterHandler)(handler.handlerTag);
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
    _RNGestureHandlerModule.default.createGestureHandler(handler.handlerName, handler.handlerTag, (0, _gestureHandlerCommon.filterConfig)(handler.config, ALLOWED_PROPS));

    (0, _handlersRegistry.registerHandler)(handler.handlerTag, handler); // use setImmediate to extract handlerTags, because all refs should be initialized
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

      _RNGestureHandlerModule.default.updateGestureHandler(handler.handlerTag, (0, _gestureHandlerCommon.filterConfig)(handler.config, ALLOWED_PROPS, {
        simultaneousHandlers: simultaneousWith,
        waitFor: requireToFail
      }));
    });
  }

  preparedGesture.config = gesture;

  for (const gesture of preparedGesture.config) {
    _RNGestureHandlerModule.default.attachGestureHandler(gesture.handlerTag, viewTag, !useAnimated // send direct events when using animatedGesture, device events otherwise
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

      _RNGestureHandlerModule.default.updateGestureHandler(handler.handlerTag, (0, _gestureHandlerCommon.filterConfig)(handler.config, ALLOWED_PROPS, {
        simultaneousHandlers: simultaneousWith,
        waitFor: requireToFail
      }));

      (0, _handlersRegistry.registerHandler)(handler.handlerTag, handler);
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
  if (!_reanimatedWrapper.Reanimated) {
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
      case _gesture.CALLBACK_TYPE.BEGAN:
        return gesture.onBegin;

      case _gesture.CALLBACK_TYPE.START:
        return gesture.onStart;

      case _gesture.CALLBACK_TYPE.UPDATE:
        return gesture.onUpdate;

      case _gesture.CALLBACK_TYPE.CHANGE:
        return gesture.onChange;

      case _gesture.CALLBACK_TYPE.END:
        return gesture.onEnd;

      case _gesture.CALLBACK_TYPE.FINALIZE:
        return gesture.onFinalize;

      case _gesture.CALLBACK_TYPE.TOUCHES_DOWN:
        return gesture.onTouchesDown;

      case _gesture.CALLBACK_TYPE.TOUCHES_MOVE:
        return gesture.onTouchesMove;

      case _gesture.CALLBACK_TYPE.TOUCHES_UP:
        return gesture.onTouchesUp;

      case _gesture.CALLBACK_TYPE.TOUCHES_CANCELLED:
        return gesture.onTouchesCancelled;
    }
  }

  function touchEventTypeToCallbackType(eventType) {
    'worklet';

    switch (eventType) {
      case _EventType.EventType.TOUCHES_DOWN:
        return _gesture.CALLBACK_TYPE.TOUCHES_DOWN;

      case _EventType.EventType.TOUCHES_MOVE:
        return _gesture.CALLBACK_TYPE.TOUCHES_MOVE;

      case _EventType.EventType.TOUCHES_UP:
        return _gesture.CALLBACK_TYPE.TOUCHES_UP;

      case _EventType.EventType.TOUCHES_CANCELLED:
        return _gesture.CALLBACK_TYPE.TOUCHES_CANCELLED;
    }

    return _gesture.CALLBACK_TYPE.UNDEFINED;
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


  const sharedHandlersCallbacks = _reanimatedWrapper.Reanimated.useSharedValue(null); // eslint-disable-next-line react-hooks/rules-of-hooks


  const lastUpdateEvent = _reanimatedWrapper.Reanimated.useSharedValue([]); // not every gesture needs a state controller, init them lazily


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
          if (event.oldState === _State.State.UNDETERMINED && event.state === _State.State.BEGAN) {
            runWorklet(_gesture.CALLBACK_TYPE.BEGAN, gesture, event);
          } else if ((event.oldState === _State.State.BEGAN || event.oldState === _State.State.UNDETERMINED) && event.state === _State.State.ACTIVE) {
            runWorklet(_gesture.CALLBACK_TYPE.START, gesture, event);
            lastUpdateEvent.value[gesture.handlerTag] = undefined;
          } else if (event.oldState !== event.state && event.state === _State.State.END) {
            if (event.oldState === _State.State.ACTIVE) {
              runWorklet(_gesture.CALLBACK_TYPE.END, gesture, event, true);
            }

            runWorklet(_gesture.CALLBACK_TYPE.FINALIZE, gesture, event, true);
          } else if ((event.state === _State.State.FAILED || event.state === _State.State.CANCELLED) && event.state !== event.oldState) {
            if (event.oldState === _State.State.ACTIVE) {
              runWorklet(_gesture.CALLBACK_TYPE.END, gesture, event, false);
            }

            runWorklet(_gesture.CALLBACK_TYPE.FINALIZE, gesture, event, false);
          }
        } else if (isTouchEvent(event)) {
          if (!stateControllers[i]) {
            stateControllers[i] = _gestureStateManager.GestureStateManager.create(event.handlerTag);
          }

          if (event.eventType !== _EventType.EventType.UNDETERMINED) {
            runWorklet(touchEventTypeToCallbackType(event.eventType), gesture, event, stateControllers[i]);
          }
        } else {
          runWorklet(_gesture.CALLBACK_TYPE.UPDATE, gesture, event);

          if (gesture.onChange && gesture.changeEventCalculator) {
            var _gesture$changeEventC;

            runWorklet(_gesture.CALLBACK_TYPE.CHANGE, gesture, (_gesture$changeEventC = gesture.changeEventCalculator) === null || _gesture$changeEventC === void 0 ? void 0 : _gesture$changeEventC.call(gesture, event, lastUpdateEvent.value[gesture.handlerTag]));
            lastUpdateEvent.value[gesture.handlerTag] = event;
          }
        }
      }
    }
  }; // eslint-disable-next-line react-hooks/rules-of-hooks


  const event = _reanimatedWrapper.Reanimated.useEvent(callback, ['onGestureHandlerStateChange', 'onGestureHandlerEvent'], true);

  preparedGesture.animatedEventHandler = event;
  preparedGesture.animatedHandlers = sharedHandlersCallbacks;
}

const GestureDetector = props => {
  var _gestureConfig$toGest, _gestureConfig$toGest2;

  const gestureConfig = props.gesture;
  const gesture = (_gestureConfig$toGest = gestureConfig === null || gestureConfig === void 0 ? void 0 : (_gestureConfig$toGest2 = gestureConfig.toGestureArray) === null || _gestureConfig$toGest2 === void 0 ? void 0 : _gestureConfig$toGest2.call(gestureConfig)) !== null && _gestureConfig$toGest !== void 0 ? _gestureConfig$toGest : [];
  const useAnimated = gesture.find(gesture => gesture.handlers.isWorklet.reduce((prev, current) => prev || current)) != null;
  const viewRef = (0, _react.useRef)(null);
  const firstRenderRef = (0, _react.useRef)(true);

  const preparedGesture = _react.default.useRef({
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

  (0, _react.useEffect)(() => {
    firstRenderRef.current = true;
    const viewTag = (0, _gestureHandlerCommon.findNodeHandle)(viewRef.current);
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
  (0, _react.useEffect)(() => {
    if (!firstRenderRef.current) {
      const viewTag = (0, _gestureHandlerCommon.findNodeHandle)(viewRef.current);

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
    return /*#__PURE__*/_react.default.createElement(AnimatedWrap, {
      ref: viewRef,
      onGestureHandlerEvent: preparedGesture.animatedEventHandler
    }, props.children);
  } else {
    return /*#__PURE__*/_react.default.createElement(Wrap, {
      ref: viewRef
    }, props.children);
  }
};

exports.GestureDetector = GestureDetector;

class Wrap extends _react.default.Component {
  render() {
    // I don't think that fighting with types over such a simple function is worth it
    // The only thing it does is add 'collapsable: false' to the child component
    // to make sure it is in the native view hierarchy so the detector can find
    // correct viewTag to attach to.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child = _react.default.Children.only(this.props.children);

    return /*#__PURE__*/_react.default.cloneElement(child, {
      collapsable: false
    }, // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    child.props.children);
  }

}

const AnimatedWrap = (_Reanimated$default$c = _reanimatedWrapper.Reanimated === null || _reanimatedWrapper.Reanimated === void 0 ? void 0 : (_Reanimated$default = _reanimatedWrapper.Reanimated.default) === null || _Reanimated$default === void 0 ? void 0 : _Reanimated$default.createAnimatedComponent(Wrap)) !== null && _Reanimated$default$c !== void 0 ? _Reanimated$default$c : Wrap;
//# sourceMappingURL=GestureDetector.js.map