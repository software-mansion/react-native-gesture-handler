import React, { PropTypes } from 'react';
import {
  ScrollView,
  Slider,
  Switch,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  WebView,
} from 'react-native';

import NativeModules from 'NativeModules';
import findNodeHandle from 'react/lib/findNodeHandle';

const RNGestureHandlerModule = NativeModules.RNGestureHandlerModule;

const State = RNGestureHandlerModule.State

const CHILD_REF = 'CHILD_REF';

let handlerTag = 1

const GestureHandlerPropTypes = {
  shouldCancelWhenOutside: PropTypes.bool,
  shouldCancelOthersWhenActivated: PropTypes.bool,
  shouldBeRequiredByOthersToFail: PropTypes.bool,
  onGestureEvent: PropTypes.func,
  onHandlerStateChange: PropTypes.func,
}

function filterConfig(component) {
  const props = component.props;
  const validProps = component.constructor.propTypes
  const res = {};
  Object.keys(validProps).forEach(key => {
    if (key in props && validProps[key] !== PropTypes.func) {
      res[key] = props[key];
    }
  })
  return res;
}

function createHandler(handlerName, propTypes = null) {
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
        filterConfig(this)
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
});
const LongPressGestureHandler = createHandler('LongPressGestureHandler', {
  minDurationMs: PropTypes.number,
});
const PanGestureHandler = createHandler('PanGestureHandler', {
  minDeltaX: PropTypes.number,
  minDeltaY: PropTypes.number,
  minDist: PropTypes.number,
  maxVelocity: PropTypes.number,
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
