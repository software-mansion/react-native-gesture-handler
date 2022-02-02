var _UIManagerAny$getView, _UIManagerAny$getView2, _UIManagerAny$getCons;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import * as React from 'react';
import { Platform, Touchable, UIManager, DeviceEventEmitter } from 'react-native'; // @ts-ignore - it isn't typed by TS & don't have definitelyTyped types

import deepEqual from 'lodash/isEqual';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import { State } from '../State';
import { handlerIDToTag, getNextHandlerTag } from './handlersRegistry';
import { filterConfig, findNodeHandle } from './gestureHandlerCommon';
const UIManagerAny = UIManager;
const customGHEventsConfig = {
  onGestureHandlerEvent: {
    registrationName: 'onGestureHandlerEvent'
  },
  onGestureHandlerStateChange: {
    registrationName: 'onGestureHandlerStateChange'
  }
}; // Add gesture specific events to genericDirectEventTypes object exported from UIManager
// native module.
// Once new event types are registered with react it is possible to dispatch these
// events to all kind of native views.

UIManagerAny.genericDirectEventTypes = { ...UIManagerAny.genericDirectEventTypes,
  ...customGHEventsConfig
}; // In newer versions of RN the `genericDirectEventTypes` is located in the object
// returned by UIManager.getViewManagerConfig('getConstants') or in older RN UIManager.getConstants(), we need to add it there as well to make
// it compatible with RN 61+

const UIManagerConstants = (_UIManagerAny$getView = (_UIManagerAny$getView2 = UIManagerAny.getViewManagerConfig) === null || _UIManagerAny$getView2 === void 0 ? void 0 : _UIManagerAny$getView2.call(UIManagerAny, 'getConstants')) !== null && _UIManagerAny$getView !== void 0 ? _UIManagerAny$getView : (_UIManagerAny$getCons = UIManagerAny.getConstants) === null || _UIManagerAny$getCons === void 0 ? void 0 : _UIManagerAny$getCons.call(UIManagerAny);

if (UIManagerConstants) {
  UIManagerConstants.genericDirectEventTypes = { ...UIManagerConstants.genericDirectEventTypes,
    ...customGHEventsConfig
  };
} // Wrap JS responder calls and notify gesture handler manager


const {
  setJSResponder: oldSetJSResponder = () => {//no operation
  },
  clearJSResponder: oldClearJSResponder = () => {//no operation
  }
} = UIManagerAny;

UIManagerAny.setJSResponder = (tag, blockNativeResponder) => {
  RNGestureHandlerModule.handleSetJSResponder(tag, blockNativeResponder);
  oldSetJSResponder(tag, blockNativeResponder);
};

UIManagerAny.clearJSResponder = () => {
  RNGestureHandlerModule.handleClearJSResponder();
  oldClearJSResponder();
};

let allowTouches = true;
const DEV_ON_ANDROID = __DEV__ && Platform.OS === 'android'; // Toggled inspector blocks touch events in order to allow inspecting on Android
// This needs to be a global variable in order to set initial state for `allowTouches` property in Handler component

if (DEV_ON_ANDROID) {
  DeviceEventEmitter.addListener('toggleElementInspector', () => {
    allowTouches = !allowTouches;
  });
}

function hasUnresolvedRefs(props) {
  // TODO(TS) - add type for extract arg
  const extract = refs => {
    if (!Array.isArray(refs)) {
      return refs && refs.current === null;
    }

    return refs.some(r => r && r.current === null);
  };

  return extract(props['simultaneousHandlers']) || extract(props['waitFor']);
}

const stateToPropMappings = {
  [State.UNDETERMINED]: undefined,
  [State.BEGAN]: 'onBegan',
  [State.FAILED]: 'onFailed',
  [State.CANCELLED]: 'onCancelled',
  [State.ACTIVE]: 'onActivated',
  [State.END]: 'onEnded'
};
let showedRngh2Notice = false;

function showRngh2NoticeIfNeeded() {
  if (!showedRngh2Notice) {
    console.warn("[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!");
    showedRngh2Notice = true;
  }
} // TODO(TS) - make sure that BaseGestureHandlerProps doesn't need other generic parameter to work with custom properties.


export default function createHandler({
  name,
  allowedProps = [],
  config = {},
  transformProps,
  customNativeProps = []
}) {
  class Handler extends React.Component {
    constructor(props) {
      super(props);

      _defineProperty(this, "handlerTag", void 0);

      _defineProperty(this, "config", void 0);

      _defineProperty(this, "propsRef", void 0);

      _defineProperty(this, "viewNode", void 0);

      _defineProperty(this, "viewTag", void 0);

      _defineProperty(this, "updateEnqueued", null);

      _defineProperty(this, "inspectorToggleListener", void 0);

      _defineProperty(this, "onGestureHandlerEvent", event => {
        if (event.nativeEvent.handlerTag === this.handlerTag) {
          var _this$props$onGesture, _this$props;

          (_this$props$onGesture = (_this$props = this.props).onGestureEvent) === null || _this$props$onGesture === void 0 ? void 0 : _this$props$onGesture.call(_this$props, event);
        } else {
          var _this$props$onGesture2, _this$props2;

          (_this$props$onGesture2 = (_this$props2 = this.props).onGestureHandlerEvent) === null || _this$props$onGesture2 === void 0 ? void 0 : _this$props$onGesture2.call(_this$props2, event);
        }
      });

      _defineProperty(this, "onGestureHandlerStateChange", event => {
        if (event.nativeEvent.handlerTag === this.handlerTag) {
          var _this$props$onHandler, _this$props3;

          (_this$props$onHandler = (_this$props3 = this.props).onHandlerStateChange) === null || _this$props$onHandler === void 0 ? void 0 : _this$props$onHandler.call(_this$props3, event);
          const state = event.nativeEvent.state;
          const stateEventName = stateToPropMappings[state];
          const eventHandler = stateEventName && this.props[stateEventName];

          if (eventHandler && typeof eventHandler === 'function') {
            eventHandler(event);
          }
        } else {
          var _this$props$onGesture3, _this$props4;

          (_this$props$onGesture3 = (_this$props4 = this.props).onGestureHandlerStateChange) === null || _this$props$onGesture3 === void 0 ? void 0 : _this$props$onGesture3.call(_this$props4, event);
        }
      });

      _defineProperty(this, "refHandler", node => {
        this.viewNode = node;
        const child = React.Children.only(this.props.children); // TODO(TS) fix ref type

        const {
          ref
        } = child;

        if (ref !== null) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      });

      _defineProperty(this, "createGestureHandler", newConfig => {
        this.config = newConfig;
        RNGestureHandlerModule.createGestureHandler(name, this.handlerTag, newConfig);
      });

      _defineProperty(this, "attachGestureHandler", newViewTag => {
        this.viewTag = newViewTag;

        if (Platform.OS === 'web') {
          // typecast due to dynamic resolution, attachGestureHandler should have web version signature in this branch
          RNGestureHandlerModule.attachGestureHandler(this.handlerTag, newViewTag, false, this.propsRef);
        } else {
          RNGestureHandlerModule.attachGestureHandler(this.handlerTag, newViewTag, false);
        }
      });

      _defineProperty(this, "updateGestureHandler", newConfig => {
        this.config = newConfig;
        RNGestureHandlerModule.updateGestureHandler(this.handlerTag, newConfig);
      });

      this.handlerTag = getNextHandlerTag();
      this.config = {};
      this.propsRef = /*#__PURE__*/React.createRef();
      this.state = {
        allowTouches
      };

      if (props.id) {
        if (handlerIDToTag[props.id] !== undefined) {
          throw new Error(`Handler with ID "${props.id}" already registered`);
        }

        handlerIDToTag[props.id] = this.handlerTag;
      }

      if (__DEV__) {
        showRngh2NoticeIfNeeded();
      }
    }

    componentDidMount() {
      const props = this.props;

      if (DEV_ON_ANDROID) {
        this.inspectorToggleListener = DeviceEventEmitter.addListener('toggleElementInspector', () => {
          this.setState(_ => ({
            allowTouches
          }));
          this.update();
        });
      }

      if (hasUnresolvedRefs(props)) {
        // If there are unresolved refs (e.g. ".current" has not yet been set)
        // passed as `simultaneousHandlers` or `waitFor`, we enqueue a call to
        // _update method that will try to update native handler props using
        // setImmediate. This makes it so update() function gets called after all
        // react components are mounted and we expect the missing ref object to
        // be resolved by then.
        this.updateEnqueued = setImmediate(() => {
          this.updateEnqueued = null;
          this.update();
        });
      }

      this.createGestureHandler(filterConfig(transformProps ? transformProps(this.props) : this.props, [...allowedProps, ...customNativeProps], config));
      this.attachGestureHandler(findNodeHandle(this.viewNode)); // TODO(TS) - check if this can be null
    }

    componentDidUpdate() {
      const viewTag = findNodeHandle(this.viewNode);

      if (this.viewTag !== viewTag) {
        this.attachGestureHandler(viewTag); // TODO(TS) - check interaction between _viewTag & findNodeHandle
      }

      this.update();
    }

    componentWillUnmount() {
      var _this$inspectorToggle;

      (_this$inspectorToggle = this.inspectorToggleListener) === null || _this$inspectorToggle === void 0 ? void 0 : _this$inspectorToggle.remove();
      RNGestureHandlerModule.dropGestureHandler(this.handlerTag);

      if (this.updateEnqueued) {
        clearImmediate(this.updateEnqueued);
      } // We can't use this.props.id directly due to TS generic type narrowing bug, see https://github.com/microsoft/TypeScript/issues/13995 for more context


      const handlerID = this.props.id;

      if (handlerID) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete handlerIDToTag[handlerID];
      }
    }

    update() {
      const newConfig = filterConfig(transformProps ? transformProps(this.props) : this.props, [...allowedProps, ...customNativeProps], config);

      if (!deepEqual(this.config, newConfig)) {
        this.updateGestureHandler(newConfig);
      }
    }

    setNativeProps(updates) {
      const mergedProps = { ...this.props,
        ...updates
      };
      const newConfig = filterConfig(transformProps ? transformProps(mergedProps) : mergedProps, [...allowedProps, ...customNativeProps], config);
      this.updateGestureHandler(newConfig);
    }

    render() {
      let gestureEventHandler = this.onGestureHandlerEvent; // Another instance of https://github.com/microsoft/TypeScript/issues/13995

      const {
        onGestureEvent,
        onGestureHandlerEvent
      } = this.props;

      if (onGestureEvent && typeof onGestureEvent !== 'function') {
        // If it's not a method it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerEvent) {
          throw new Error('Nesting touch handlers with native animated driver is not supported yet');
        }

        gestureEventHandler = onGestureEvent;
      } else {
        if (onGestureHandlerEvent && typeof onGestureHandlerEvent !== 'function') {
          throw new Error('Nesting touch handlers with native animated driver is not supported yet');
        }
      }

      let gestureStateEventHandler = this.onGestureHandlerStateChange; // Another instance of https://github.com/microsoft/TypeScript/issues/13995

      const {
        onHandlerStateChange,
        onGestureHandlerStateChange
      } = this.props;

      if (onHandlerStateChange && typeof onHandlerStateChange !== 'function') {
        // If it's not a method it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerStateChange) {
          throw new Error('Nesting touch handlers with native animated driver is not supported yet');
        }

        gestureStateEventHandler = onHandlerStateChange;
      } else {
        if (onGestureHandlerStateChange && typeof onGestureHandlerStateChange !== 'function') {
          throw new Error('Nesting touch handlers with native animated driver is not supported yet');
        }
      }

      const events = {
        onGestureHandlerEvent: this.state.allowTouches ? gestureEventHandler : undefined,
        onGestureHandlerStateChange: this.state.allowTouches ? gestureStateEventHandler : undefined
      };
      this.propsRef.current = events;
      const child = React.Children.only(this.props.children);
      let grandChildren = child.props.children;

      if (Touchable.TOUCH_TARGET_DEBUG && child.type && (child.type === 'RNGestureHandlerButton' || child.type.name === 'View' || child.type.displayName === 'View')) {
        grandChildren = React.Children.toArray(grandChildren);
        grandChildren.push(Touchable.renderDebugView({
          color: 'mediumspringgreen',
          hitSlop: child.props.hitSlop
        }));
      }

      return /*#__PURE__*/React.cloneElement(child, {
        ref: this.refHandler,
        collapsable: false,
        ...events
      }, grandChildren);
    }

  }

  _defineProperty(Handler, "displayName", name);

  return Handler;
}
//# sourceMappingURL=createHandler.js.map