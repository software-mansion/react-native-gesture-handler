import React, { PropTypes } from 'react';
import {
  findNodeHandle,
  NativeModules,
  ScrollView,
  Slider,
  Switch,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
  WebView,
} from 'react-native';

const RNGestureHandlerModule = NativeModules.RNGestureHandlerModule;

/* Wrap JS responder calls and notify gesture handler manager */
const { UIManager } = NativeModules;
const { setJSResponder: oldSetJSResponder, clearJSResponder: oldClearJSResponder } = UIManager;
UIManager.setJSResponder = (tag, blockNativeResponder) => {
  RNGestureHandlerModule.handleSetJSResponder(tag, blockNativeResponder);
  oldSetJSResponder(tag, blockNativeResponder);
}
UIManager.clearJSResponder = () => {
  RNGestureHandlerModule.handleClearJSResponder();
  oldClearJSResponder();
}

const State = RNGestureHandlerModule.State;

const CHILD_REF = 'CHILD_REF';

let handlerTag = 1;
const handlerIDToTag = {};

const GestureHandlerPropTypes = {
  id: PropTypes.string,
  waitFor: PropTypes.oneOf(PropTypes.string),
  simultaneousHandlers: PropTypes.oneOf(PropTypes.string),
  shouldCancelWhenOutside: PropTypes.bool,
  hitSlop: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      left: PropTypes.number,
      top: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number,
      vertical: PropTypes.number,
      horizontal: PropTypes.number,
    }),
  ]),
  onGestureEvent: PropTypes.func,
  onHandlerStateChange: PropTypes.func,
}

function canUseNativeParam(param) {
  return param !== undefined && (typeof param !== 'function') &&
    ((typeof param !== 'object') || !('__isNative' in param));
}

function transformIntoHandlerTags(handlerIDs) {
  if (!Array.isArray(handlerIDs)) {
    handlerIDs = [ handlerIDs ];
  }
  // converts handler string IDs into their numeric tags
  return handlerIDs
    .map(handlerID => handlerIDToTag[handlerID] || -1)
    .filter(handlerTag => handlerTag > 0);
}

function filterConfig(component, defaults = {}) {
  const props = component.props;
  const validProps = component.constructor.propTypes
  const res = { ...defaults };
  Object.keys(validProps).forEach(key => {
    const value = props[key]
    if (canUseNativeParam(value)) {
      let value = props[key];
      if (key === 'simultaneousHandlers' || key === 'waitFor') {
        value = transformIntoHandlerTags(props[key]);
      }
      res[key] = value;
    }
  });
  return res;
}

function createHandler(handlerName, propTypes = null, config = {}) {
  class Handler extends React.Component {
    static propTypes = {
      ...GestureHandlerPropTypes,
      ...propTypes,
    }

    constructor(props) {
      super(props);
      this._handlerTag = handlerTag++;
      if (props.id) {
        if (handlerIDToTag[props.id] !== undefined) {
          throw new Error(`Handler with ID "${props.id}" already registered`);
        }
        handlerIDToTag[props.id] = this._handlerTag;
      }
    }

    _onGestureHandlerEvent = (event) => {
      if (event.nativeEvent.handlerTag === this._handlerTag) {
        this.props.onGestureEvent && this.props.onGestureEvent(event);
      } else {
        this.props.onGestureHandlerEvent && this.props.onGestureHandlerEvent(event);
      }
    }

    _onGestureHandlerStateChange = (event) => {
      if (event.nativeEvent.handlerTag === this._handlerTag) {
        this.props.onHandlerStateChange && this.props.onHandlerStateChange(event);
      } else {
        this.props.onGestureHandlerStateChange && this.props.onGestureHandlerStateChange(event);
      }
    }

    componentWillUnmount() {
      const viewTag = findNodeHandle(this.refs[CHILD_REF]);
      RNGestureHandlerModule.dropGestureHandlersForView(viewTag);
      if (this.props.id) {
        delete handlerIDToTag[this.props.id];
      }
    }

    componentDidMount() {
      const viewTag = findNodeHandle(this.refs[CHILD_REF]);
      RNGestureHandlerModule.createGestureHandler(
        viewTag,
        handlerName,
        this._handlerTag,
        filterConfig(this, config)
      );
    }

    componentDidUpdate(prevProps, prevState) {
      // TODO: Support gesturehandler config updates
    }

    render() {
      let gestureEventHandler = this._onGestureHandlerEvent;
      const { onGestureEvent, onGestureHandlerEvent } = this.props;
      if (onGestureEvent && (typeof onGestureEvent !== 'function')) {
        // If it's not a mathod it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerEvent) {
          throw new Error('Nesting touch handlers with native animated driver is not supported yet');
        }
        gestureEventHandler = this.props.onGestureEvent;
      } else {
        if (onGestureHandlerEvent && (typeof onGestureHandlerEvent !== 'function')) {
          throw new Error('Nesting touch handlers with native animated driver is not supported yet');
        }
      }
      const child = React.Children.only(this.props.children);
      return React.cloneElement(child, {
        ref: CHILD_REF,
        collapsable: false,
        onGestureHandlerEvent: gestureEventHandler,
        onGestureHandlerStateChange: this._onGestureHandlerStateChange,
      });
    }
  }
  return Handler;
}

const NativeViewGestureHandler = createHandler('NativeViewGestureHandler', {
  shouldActivateOnStart: PropTypes.bool,

});
const TapGestureHandler = createHandler('TapGestureHandler', {
  maxDurationMs: PropTypes.number,
  maxDelayMs: PropTypes.number,
  numberOfTaps: PropTypes.number,
}, {
  shouldCancelOthersWhenActivated: true,
});
const LongPressGestureHandler = createHandler('LongPressGestureHandler', {
  minDurationMs: PropTypes.number,
}, {
  shouldCancelOthersWhenActivated: true,
});
const PanGestureHandler = createHandler('PanGestureHandler', {
  minDeltaX: PropTypes.number,
  minDeltaY: PropTypes.number,
  minDist: PropTypes.number,
  maxVelocity: PropTypes.number,
  minPointers: PropTypes.number,
  maxPointers: PropTypes.number,
}, {
  shouldCancelOthersWhenActivated: true,
});
const PinchGestureHandler = createHandler('PinchGestureHandler', {}, {});
const RotationGestureHandler = createHandler('RotationGestureHandler', {}, {});

function createNativeWrapper(Component, config = {}) {
  class ComponentWrapper extends React.Component {
    static propTypes = {
      ...GestureHandlerPropTypes,
      ...Component.propTypes,
    }

    constructor(props) {
      super(props);
      this._handlerTag = handlerTag++;
      if (props.id) {
        if (handlerIDToTag[props.id] !== undefined) {
          throw new Error(`Handler with ID "${props.id}" already registered`);
        }
        handlerIDToTag[props.id] = this._handlerTag;
      }
    }

    componentWillUnmount() {
      const viewTag = findNodeHandle(this.refs[CHILD_REF]);
      RNGestureHandlerModule.dropGestureHandlersForView(viewTag);
      if (this.props.id) {
        delete handlerIDToTag[this.props.id];
      }
    }

    componentDidMount() {
      const viewTag = findNodeHandle(this.refs[CHILD_REF]);
      RNGestureHandlerModule.createGestureHandler(
        viewTag,
        'NativeViewGestureHandler',
        this._handlerTag,
        filterConfig(this, config)
      );
    }

    render() {
      return <Component {...this.props} ref={CHILD_REF} />;
    }
  }
  return ComponentWrapper;
}

const WrappedScrollView = createNativeWrapper(ScrollView);
const WrappedSlider = createNativeWrapper(Slider, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});
const WrappedSwitch = createNativeWrapper(Switch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});
const WrappedTextInput = createNativeWrapper(TextInput);
const WrappedWebView = createNativeWrapper(WebView);

const WrappedToolbarAndroid = createNativeWrapper(ToolbarAndroid);
const WrappedViewPagerAndroid = createNativeWrapper(ViewPagerAndroid);
const WrappedDrawerLayoutAndroid = createNativeWrapper(DrawerLayoutAndroid);
WrappedDrawerLayoutAndroid.positions = DrawerLayoutAndroid.positions;

State.print = (state) => {
  const keys = Object.keys(State);
  for (const i = 0; i < keys.length; i++) {
    if (state === State[keys[i]]) {
      return keys[i];
    }
  }
}

export {
  WrappedScrollView as ScrollView,
  WrappedSlider as Slider,
  WrappedSwitch as Switch,
  WrappedTextInput as TextInput,
  WrappedToolbarAndroid as ToolbarAndroid,
  WrappedViewPagerAndroid as ViewPagerAndroid,
  WrappedDrawerLayoutAndroid as DrawerLayoutAndroid,
  WrappedWebView as WebView,
  NativeViewGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State,
}
