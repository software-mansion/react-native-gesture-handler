import React, { PropTypes } from 'react';
import {
  findNodeHandle,
  requireNativeComponent,
  Animated,
  NativeModules,
  ScrollView,
  Slider,
  Switch,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
  WebView,
  StyleSheet,
  Platform,
} from 'react-native';
import deepEqual from 'fbjs/lib/areEqual';

const RNGestureHandlerModule = NativeModules.RNGestureHandlerModule;

/* Wrap JS responder calls and notify gesture handler manager */
const { UIManager } = NativeModules;
const {
  setJSResponder: oldSetJSResponder,
  clearJSResponder: oldClearJSResponder,
} = UIManager;
UIManager.setJSResponder = (tag, blockNativeResponder) => {
  RNGestureHandlerModule.handleSetJSResponder(tag, blockNativeResponder);
  oldSetJSResponder(tag, blockNativeResponder);
};
UIManager.clearJSResponder = () => {
  RNGestureHandlerModule.handleClearJSResponder();
  oldClearJSResponder();
};

const State = RNGestureHandlerModule.State;

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
  onGestureEvent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  onHandlerStateChange: PropTypes.func,
};

function canUseNativeParam(param) {
  return (
    param !== undefined &&
    typeof param !== 'function' &&
    (typeof param !== 'object' || !('__isNative' in param))
  );
}

function transformIntoHandlerTags(handlerIDs) {
  if (!Array.isArray(handlerIDs)) {
    handlerIDs = [handlerIDs];
  }
  // converts handler string IDs into their numeric tags
  return handlerIDs
    .map(handlerID => handlerIDToTag[handlerID] || -1)
    .filter(handlerTag => handlerTag > 0);
}

function filterConfig(props, validProps, defaults = {}) {
  const res = { ...defaults };
  Object.keys(validProps).forEach(key => {
    const value = props[key];
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
    };

    constructor(props) {
      super(props);
      this._handlerTag = handlerTag++;
      this._config = {};
      if (props.id) {
        if (handlerIDToTag[props.id] !== undefined) {
          throw new Error(`Handler with ID "${props.id}" already registered`);
        }
        handlerIDToTag[props.id] = this._handlerTag;
      }
    }

    _onGestureHandlerEvent = event => {
      if (event.nativeEvent.handlerTag === this._handlerTag) {
        this.props.onGestureEvent && this.props.onGestureEvent(event);
      } else {
        this.props.onGestureHandlerEvent &&
          this.props.onGestureHandlerEvent(event);
      }
    };

    _onGestureHandlerStateChange = event => {
      if (event.nativeEvent.handlerTag === this._handlerTag) {
        this.props.onHandlerStateChange &&
          this.props.onHandlerStateChange(event);
      } else {
        this.props.onGestureHandlerStateChange &&
          this.props.onGestureHandlerStateChange(event);
      }
    };

    _refHandler = node => {
      this._viewNode = node;

      const child = React.Children.only(this.props.children);
      const { ref } = child;
      if (typeof ref === 'function') {
        ref(node);
      }
    };

    componentWillUnmount() {
      const viewTag = findNodeHandle(this._viewNode);
      RNGestureHandlerModule.dropGestureHandlersForView(viewTag);
      if (this.props.id) {
        delete handlerIDToTag[this.props.id];
      }
    }

    componentDidMount() {
      const viewTag = findNodeHandle(this._viewNode);
      this._config = filterConfig(
        this.props,
        this.constructor.propTypes,
        config
      );
      RNGestureHandlerModule.createGestureHandler(
        viewTag,
        handlerName,
        this._handlerTag,
        this._config
      );
    }

    componentDidUpdate(prevProps, prevState) {
      const viewTag = findNodeHandle(this._viewNode);
      const newConfig = filterConfig(
        this.props,
        this.constructor.propTypes,
        config
      );
      if (!deepEqual(this._config, newConfig)) {
        this._config = newConfig;
        RNGestureHandlerModule.updateGestureHandler(
          viewTag,
          this._handlerTag,
          this._config
        );
      }
    }

    render() {
      let gestureEventHandler = this._onGestureHandlerEvent;
      const { onGestureEvent, onGestureHandlerEvent } = this.props;
      if (onGestureEvent && typeof onGestureEvent !== 'function') {
        // If it's not a mathod it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerEvent) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
        gestureEventHandler = this.props.onGestureEvent;
      } else {
        if (
          onGestureHandlerEvent &&
          typeof onGestureHandlerEvent !== 'function'
        ) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
      }
      const child = React.Children.only(this.props.children);
      return React.cloneElement(child, {
        ref: this._refHandler,
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
  disallowInterruption: PropTypes.bool,
});
const TapGestureHandler = createHandler(
  'TapGestureHandler',
  {
    maxDurationMs: PropTypes.number,
    maxDelayMs: PropTypes.number,
    numberOfTaps: PropTypes.number,
  },
  {}
);
const LongPressGestureHandler = createHandler(
  'LongPressGestureHandler',
  {
    minDurationMs: PropTypes.number,
  },
  {}
);
const PanGestureHandler = createHandler(
  'PanGestureHandler',
  {
    minDeltaX: PropTypes.number,
    minDeltaY: PropTypes.number,
    maxDeltaX: PropTypes.number,
    maxDeltaY: PropTypes.number,
    minOffsetX: PropTypes.number,
    minOffsetY: PropTypes.number,
    minDist: PropTypes.number,
    minVelocity: PropTypes.number,
    minVelocityX: PropTypes.number,
    minVelocityY: PropTypes.number,
    minPointers: PropTypes.number,
    maxPointers: PropTypes.number,
    avgTouches: PropTypes.bool,
  },
  {}
);
const PinchGestureHandler = createHandler('PinchGestureHandler', {}, {});
const RotationGestureHandler = createHandler('RotationGestureHandler', {}, {});

function createNativeWrapper(Component, config = {}) {
  class ComponentWrapper extends React.Component {
    static propTypes = {
      ...NativeViewGestureHandler.propTypes,
      ...Component.propTypes,
    };

    constructor(props) {
      super(props);
      this._handlerTag = handlerTag++;
      this._config = {};
      if (props.id) {
        if (handlerIDToTag[props.id] !== undefined) {
          throw new Error(`Handler with ID "${props.id}" already registered`);
        }
        handlerIDToTag[props.id] = this._handlerTag;
      }
    }

    _refHandler = node => {
      this._viewNode = node;
    };

    componentWillUnmount() {
      const viewTag = findNodeHandle(this._viewNode);
      RNGestureHandlerModule.dropGestureHandlersForView(viewTag);
      if (this.props.id) {
        delete handlerIDToTag[this.props.id];
      }
    }

    componentDidMount() {
      const viewTag = findNodeHandle(this._viewNode);
      this._config = filterConfig(
        this.props,
        NativeViewGestureHandler.propTypes,
        config
      );
      RNGestureHandlerModule.createGestureHandler(
        viewTag,
        'NativeViewGestureHandler',
        this._handlerTag,
        this._config
      );
    }

    componentDidUpdate(prevProps, prevState) {
      const viewTag = findNodeHandle(this._viewNode);
      const newConfig = filterConfig(
        this.props,
        NativeViewGestureHandler.propTypes,
        config
      );
      if (!deepEqual(this._config, newConfig)) {
        this._config = newConfig;
        RNGestureHandlerModule.updateGestureHandler(
          viewTag,
          this._handlerTag,
          this._config
        );
      }
    }

    render() {
      const { onGestureEvent, onHandlerStateChange, ...rest } = this.props;
      return (
        <Component
          {...rest}
          onGestureHandlerEvent={onGestureEvent}
          onGestureHandlerStateChange={onHandlerStateChange}
          ref={this._refHandler}
        />
      );
    }
  }
  return ComponentWrapper;
}

const WrappedScrollView = createNativeWrapper(ScrollView, {
  disallowInterruption: true,
});
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

State.print = state => {
  const keys = Object.keys(State);
  for (const i = 0; i < keys.length; i++) {
    if (state === State[keys[i]]) {
      return keys[i];
    }
  }
};

const RawButton = createNativeWrapper(
  requireNativeComponent('RNGestureHandlerButton', null),
  {
    shouldCancelWhenOutside: false,
    shouldActivateOnStart: false,
  }
);

/* Buttons */

class BaseButton extends React.Component {
  static propTypes = RawButton.propTypes;
  constructor(props) {
    super(props);
    this._lastActive = false;
  }
  _onHandlerEvent = e => {
    const { state, oldState, pointerInside } = e.nativeEvent;
    const active = pointerInside && state === State.ACTIVE;
    if (active != this._lastActive) {
      this.props.onActiveStateChange && this.props.onActiveStateChange(active);
    }
    if (
      oldState === State.ACTIVE &&
      state !== State.CANCELLED &&
      this._lastActive
    ) {
      this.props.onPress && this.props.onPress(active);
    }
    this._lastActive = active;
  };
  render() {
    return (
      <RawButton
        {...this.props}
        onHandlerStateChange={this._onHandlerEvent}
        onGestureEvent={this._onHandlerEvent}
      />
    );
  }
}

const btnStyles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});

class RectButton extends React.Component {
  static propTypes = BaseButton.propTypes;
  static defaultProps = {
    activeOpacity: 0.105,
    underlayColor: 'black',
  };
  constructor(props) {
    super(props);
    this._opacity = new Animated.Value(0);
  }
  _handleActiveStateChange = Platform.OS === 'android'
    ? null
    : active => {
        this._opacity.setValue(active ? this.props.activeOpacity : 0);
      };
  render() {
    const { children, ...rest } = this.props;
    return (
      <BaseButton {...rest} onActiveStateChange={this._handleActiveStateChange}>
        <Animated.View
          style={[
            btnStyles.underlay,
            { backgroundColor: this.props.underlayColor },
            { opacity: this._opacity },
          ]}
        />
        {children}
      </BaseButton>
    );
  }
}

class BorderlessButton extends React.Component {
  static propTypes = BaseButton.propTypes;
  static defaultProps = {
    activeOpacity: 0.3,
  };
  constructor(props) {
    super(props);
    this._opacity = new Animated.Value(1);
  }
  _handleActiveStateChange = Platform.OS === 'android'
    ? null
    : active => {
        this._opacity.setValue(active ? this.props.activeOpacity : 1);
      };
  render() {
    const { children, ...rest } = this.props;
    const content =
      Platform.OS === 'android'
        ? children
        : <Animated.View style={{ opacity: this._opacity }}>
            {children}
          </Animated.View>;
    return (
      <BaseButton
        borderless={true}
        {...rest}
        onActiveStateChange={this._handleActiveStateChange}>
        {content}
      </BaseButton>
    );
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
  /* Buttons */
  RawButton,
  BaseButton,
  RectButton,
  BorderlessButton,
};
