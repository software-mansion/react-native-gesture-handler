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
  WebView,
} from 'react-native';

const RNGestureHandlerModule = NativeModules.RNGestureHandlerModule;

/* Wrap JS responder calls and notify gesture handler manager */
const UIManager = require('UIManager');
const { setJSResponder: oldSetJSResponder, clearJSResponder: oldClearJSResponder } = UIManager;
UIManager.setJSResponder = (tag, blockNativeResponder) => {
  RNGestureHandlerModule.handleSetJSResponder(tag, blockNativeResponder);
  oldSetJSResponder(tag, blockNativeResponder);
}
UIManager.clearJSResponder = () => {
  RNGestureHandlerModule.handleClearJSResponder();
  oldClearJSResponder();
}

const State = RNGestureHandlerModule.State

const CHILD_REF = 'CHILD_REF';

let handlerTag = 1

const GestureHandlerPropTypes = {
  shouldCancelWhenOutside: PropTypes.bool,
  shouldCancelOthersWhenActivated: PropTypes.bool,
  shouldBeRequiredByOthersToFail: PropTypes.bool,
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

function filterConfig(component, defaults = {}) {
  const props = component.props;
  const validProps = component.constructor.propTypes
  const res = { ...defaults };
  Object.keys(validProps).forEach(key => {
    const value = props[key]
    if (canUseNativeParam(value)) {
      res[key] = props[key];
    }
  })
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
      const child = React.Children.only(this.props.children);
      return React.cloneElement(child, {
        ref: CHILD_REF,
        collapsable: false,
        onGestureHandlerEvent: this._onGestureHandlerEvent,
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
}, {
  shouldCancelOthersWhenActivated: true,
});

function createNativeWrapper(Component, config = {}) {
  class ComponentWrapper extends React.Component {
    constructor(props) {
      super(props);
      this._handlerTag = handlerTag++;
    }

    componentWillUnmount() {
      const viewTag = findNodeHandle(this.refs[CHILD_REF]);
      RNGestureHandlerModule.dropGestureHandlersForView(viewTag);
    }

    componentDidMount() {
      const viewTag = findNodeHandle(this.refs[CHILD_REF]);
      RNGestureHandlerModule.createGestureHandler(viewTag, 'NativeViewGestureHandler', this._handlerTag, config);
    }

    render() {
      return <Component {...this.props} ref={CHILD_REF} />;
    }
  }
  return ComponentWrapper;
}

const WrappedScrollView = createNativeWrapper(ScrollView);
const WrappedSlider = createNativeWrapper(Slider, { shouldCancelWhenOutside: false, shouldActivateOnStart: true });
const WrappedSwitch = createNativeWrapper(Switch);
const WrappedTextInput = createNativeWrapper(TextInput);
const WrappedToolbarAndroid = createNativeWrapper(ToolbarAndroid);
const WrappedViewPagerAndroid = createNativeWrapper(ViewPagerAndroid);
const WrappedWebView = createNativeWrapper(WebView);

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
  WrappedWebView as WebView,
  NativeViewGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  PanGestureHandler,
  State,
}
