import React from 'react';
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
  FlatList,
  Platform,
} from 'react-native';
import Touchable from 'react-native/Libraries/Components/Touchable/Touchable';

import deepEqual from 'fbjs/lib/areEqual';
import PropTypes from 'prop-types';

import gestureHandlerRootHOC from './gestureHandlerRootHOC';

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

// Add gesture specific events to RCTView's directEventTypes object exported via UIManager.
// Once new event types are registered with react it is possible to dispatch these to other
// view types as well.
UIManager.RCTView.directEventTypes = {
  ...UIManager.RCTView.directEventTypes,
  onGestureHandlerEvent: { registrationName: 'onGestureHandlerEvent' },
  onGestureHandlerStateChange: {
    registrationName: 'onGestureHandlerStateChange',
  },
};

const State = RNGestureHandlerModule.State;

const Directions = RNGestureHandlerModule.Direction;

let handlerTag = 1;
const handlerIDToTag = {};

const GestureHandlerPropTypes = {
  id: PropTypes.string,
  minPointers: PropTypes.number,
  enabled: PropTypes.bool,
  waitFor: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    ),
  ]),
  simultaneousHandlers: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    ),
  ]),
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
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  ]),
  onGestureEvent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  onHandlerStateChange: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  onBegan: PropTypes.func,
  onFailed: PropTypes.func,
  onCancelled: PropTypes.func,
  onActivated: PropTypes.func,
  onEnded: PropTypes.func,
};

const stateToPropMappings = {
  [State.BEGAN]: 'onBegan',
  [State.FAILED]: 'onFailed',
  [State.CANCELLED]: 'onCancelled',
  [State.ACTIVE]: 'onActivated',
  [State.END]: 'onEnded',
};

function isConfigParam(param, name) {
  return (
    param !== undefined &&
    typeof param !== 'function' &&
    (typeof param !== 'object' || !('__isNative' in param)) &&
    name !== 'onHandlerStateChange' &&
    name !== 'onGestureEvent'
  );
}

function transformIntoHandlerTags(handlerIDs) {
  if (!Array.isArray(handlerIDs)) {
    handlerIDs = [handlerIDs];
  }

  // converts handler string IDs into their numeric tags
  return handlerIDs
    .map(
      handlerID =>
        handlerIDToTag[handlerID] ||
        (handlerID.current && handlerID.current._handlerTag) ||
        -1
    )
    .filter(handlerTag => handlerTag > 0);
}

function filterConfig(props, validProps, defaults = {}) {
  const res = { ...defaults };
  Object.keys(validProps).forEach(key => {
    const value = props[key];
    if (isConfigParam(value, key)) {
      let value = props[key];
      if (key === 'simultaneousHandlers' || key === 'waitFor') {
        value = transformIntoHandlerTags(props[key]);
      } else if (key === 'hitSlop') {
        if (typeof value !== 'object') {
          value = { top: value, left: value, bottom: value, right: value };
        }
      }
      res[key] = value;
    }
  });
  return res;
}

function hasUnresolvedRefs(props) {
  const extract = refs => {
    if (!Array.isArray(refs)) {
      return refs && refs.current === null;
    }
    return refs.some(r => r && r.current === null);
  };
  return extract(props['simultaneousHandlers']) || extract(props['waitFor']);
}

function createHandler(
  handlerName,
  propTypes = null,
  config = {},
  transformProps,
  customNativeProps = {}
) {
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

        const stateEventName = stateToPropMappings[event.nativeEvent.state];
        if (typeof this.props[stateEventName] === 'function') {
          this.props[stateEventName](event);
        }
      } else {
        this.props.onGestureHandlerStateChange &&
          this.props.onGestureHandlerStateChange(event);
      }
    };

    _refHandler = node => {
      this._viewNode = node;

      const child = React.Children.only(this.props.children);
      const { ref } = child;
      if (ref !== null) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    };

    componentWillUnmount() {
      RNGestureHandlerModule.dropGestureHandler(this._handlerTag);
      if (this._updateEnqueued) {
        clearImmediate(this._updateEnqueued);
      }
      if (this.props.id) {
        delete handlerIDToTag[this.props.id];
      }
    }

    componentDidMount() {
      this._viewTag = findNodeHandle(this._viewNode);
      this._config = filterConfig(
        transformProps ? transformProps(this.props) : this.props,
        { ...this.constructor.propTypes, ...customNativeProps },
        config
      );
      if (hasUnresolvedRefs(this.props)) {
        // If there are unresolved refs (e.g. ".current" has not yet been set)
        // passed as `simultaneousHandlers` or `waitFor`, we enqueue a call to
        // _update method that will try to update native handler props using
        // setImmediate. This makes it so _update function gets called after all
        // react components are mounted and we expect the missing ref object to
        // be resolved by then.
        this._updateEnqueued = setImmediate(() => {
          this._updateEnqueued = null;
          this._update();
        });
      }
      RNGestureHandlerModule.createGestureHandler(
        handlerName,
        this._handlerTag,
        this._config
      );
      RNGestureHandlerModule.attachGestureHandler(
        this._handlerTag,
        this._viewTag
      );
    }

    componentDidUpdate() {
      const viewTag = findNodeHandle(this._viewNode);
      if (this._viewTag !== viewTag) {
        this._viewTag = viewTag;
        RNGestureHandlerModule.attachGestureHandler(this._handlerTag, viewTag);
      }
      this._update();
    }

    _update() {
      const newConfig = filterConfig(
        transformProps ? transformProps(this.props) : this.props,
        { ...this.constructor.propTypes, ...customNativeProps },
        config
      );
      if (!deepEqual(this._config, newConfig)) {
        this._config = newConfig;
        RNGestureHandlerModule.updateGestureHandler(
          this._handlerTag,
          this._config
        );
      }
    }

    render() {
      let gestureEventHandler = this._onGestureHandlerEvent;
      const { onGestureEvent, onGestureHandlerEvent } = this.props;
      if (onGestureEvent && typeof onGestureEvent !== 'function') {
        // If it's not a method it should be an native Animated.event
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

      let gestureStateEventHandler = this._onGestureHandlerStateChange;
      const { onHandlerStateChange, onGestureHandlerStateChange } = this.props;
      if (onHandlerStateChange && typeof onHandlerStateChange !== 'function') {
        // If it's not a method it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerStateChange) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
        gestureStateEventHandler = this.props.onHandlerStateChange;
      } else {
        if (
          onGestureHandlerStateChange &&
          typeof onGestureHandlerStateChange !== 'function'
        ) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
      }

      const child = React.Children.only(this.props.children);
      let children = child.props.children;
      if (
        Touchable.TOUCH_TARGET_DEBUG &&
        child.type &&
        (child.type === 'RNGestureHandlerButton' ||
          child.type.name === 'View' ||
          child.type.displayName === 'View')
      ) {
        children = React.Children.toArray(children);
        children.push(
          Touchable.renderDebugView({
            color: 'mediumspringgreen',
            hitSlop: child.props.hitSlop,
          })
        );
      }
      return React.cloneElement(
        child,
        {
          ref: this._refHandler,
          collapsable: false,
          onGestureHandlerEvent: gestureEventHandler,
          onGestureHandlerStateChange: gestureStateEventHandler,
        },
        children
      );
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
    maxDeltaX: PropTypes.number,
    maxDeltaY: PropTypes.number,
    maxDist: PropTypes.number,
    minPointers: PropTypes.number,
  },
  {}
);

const FlingGestureHandler = createHandler(
  'FlingGestureHandler',
  {
    numberOfPointers: PropTypes.number,
    direction: PropTypes.number,
  },
  {}
);

const LongPressGestureHandler = createHandler(
  'LongPressGestureHandler',
  {
    minDurationMs: PropTypes.number,
    maxDist: PropTypes.number,
  },
  {}
);

function validatePanGestureHandlerProps(props) {
  if (props.minDeltaX && props.activeOffsetX) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetXStart or activeOffsetXEnd`
    );
  }
  if (props.maxDeltaX && props.failOffsetX) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetXStart or activeOffsetXEnd`
    );
  }
  if (props.minDeltaY && props.activeOffsetY) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetYStart or activeOffsetYEnd`
    );
  }
  if (props.maxDeltaY && props.failOffsetY) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetYStart or activeOffsetYEnd`
    );
  }
  if (
    Array.isArray(props.activeOffsetX) &&
    (props.activeOffsetX[0] > 0 || props.activeOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetX should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.activeOffsetY) &&
    (props.activeOffsetY[0] > 0 || props.activeOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetY should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.failOffsetX) &&
    (props.failOffsetX[0] > 0 || props.failOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetX should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.failOffsetY) &&
    (props.failOffsetY[0] > 0 || props.failOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetY should be negative, a the second one should be positive`
    );
  }
}

function transformPanGestureHandlerProps(props) {
  const res = { ...props };
  if (props.minDeltaX !== undefined) {
    delete res['minDeltaX'];
    res.activeOffsetXStart = -props.minDeltaX;
    res.activeOffsetXEnd = props.minDeltaX;
  }
  if (props.maxDeltaX !== undefined) {
    delete res['maxDeltaX'];
    res.failOffsetXStart = -props.maxDeltaX;
    res.failOffsetXEnd = props.maxDeltaX;
  }
  if (props.minOffsetX !== undefined) {
    delete res['minOffsetX'];
    if (props.minOffsetX < 0) {
      res.activeOffsetXStart = props.minOffsetX;
    } else {
      res.activeOffsetXEnd = props.minOffsetX;
    }
  }

  if (props.minDeltaY !== undefined) {
    delete res['minDeltaY'];
    res.activeOffsetYStart = -props.minDeltaY;
    res.activeOffsetYEnd = props.minDeltaY;
  }
  if (props.maxDeltaY !== undefined) {
    delete res['maxDeltaY'];
    res.failOffsetYStart = -props.maxDeltaY;
    res.failOffsetYEnd = props.maxDeltaY;
  }

  if (props.minOffsetY !== undefined) {
    delete res['minOffsetY'];
    if (props.minOffsetY < 0) {
      res.activeOffsetYStart = props.minOffsetY;
    } else {
      res.activeOffsetYEnd = props.minOffsetY;
    }
  }

  if (props.activeOffsetX !== undefined) {
    delete res['activeOffsetX'];
    if (Array.isArray(props.activeOffsetX)) {
      res.activeOffsetXStart = props.activeOffsetX[0];
      res.activeOffsetXEnd = props.activeOffsetX[1];
    } else if (props.activeOffsetX < 0) {
      res.activeOffsetXStart = props.activeOffsetX;
    } else {
      res.activeOffsetXEnd = props.activeOffsetX;
    }
  }

  if (props.activeOffsetY !== undefined) {
    delete res['activeOffsetY'];
    if (Array.isArray(props.activeOffsetY)) {
      res.activeOffsetYStart = props.activeOffsetY[0];
      res.activeOffsetYEnd = props.activeOffsetY[1];
    } else if (props.activeOffsetY < 0) {
      res.activeOffsetYStart = props.activeOffsetY;
    } else {
      res.activeOffsetYEnd = props.activeOffsetY;
    }
  }

  if (props.failOffsetX !== undefined) {
    delete res['failOffsetX'];
    if (Array.isArray(props.failOffsetX)) {
      res.failOffsetXStart = props.failOffsetX[0];
      res.failOffsetXEnd = props.failOffsetX[1];
    } else if (props.failOffsetX < 0) {
      res.failOffsetXStart = props.failOffsetX;
    } else {
      res.failOffsetXEnd = props.failOffsetX;
    }
  }

  if (props.failOffsetY !== undefined) {
    delete res['failOffsetY'];
    if (Array.isArray(props.failOffsetY)) {
      res.failOffsetYStart = props.failOffsetY[0];
      res.failOffsetYEnd = props.failOffsetY[1];
    } else if (props.failOffsetY < 0) {
      res.failOffsetYStart = props.failOffsetY;
    } else {
      res.failOffsetYEnd = props.failOffsetY;
    }
  }

  return res;
}

function managePanProps(props) {
  if (__DEV__) {
    validatePanGestureHandlerProps(props);
  }
  return transformPanGestureHandlerProps(props);
}

const PanGestureHandler = createHandler(
  'PanGestureHandler',
  {
    activeOffsetY: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    activeOffsetX: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    failOffsetY: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    failOffsetX: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    minDist: PropTypes.number,
    minVelocity: PropTypes.number,
    minVelocityX: PropTypes.number,
    minVelocityY: PropTypes.number,
    minPointers: PropTypes.number,
    maxPointers: PropTypes.number,
    avgTouches: PropTypes.bool,
  },
  {},
  managePanProps,
  {
    activeOffsetYStart: true,
    activeOffsetYEnd: true,
    activeOffsetXStart: true,
    activeOffsetXEnd: true,
    failOffsetYStart: true,
    failOffsetYEnd: true,
    failOffsetXStart: true,
    failOffsetXEnd: true,
  }
);
const PinchGestureHandler = createHandler('PinchGestureHandler', {}, {});
const RotationGestureHandler = createHandler('RotationGestureHandler', {}, {});

const NATIVE_WRAPPER_BIND_BLACKLIST = new Set(['replaceState', 'isMounted']);
const NATIVE_WRAPPER_PROPS_FILTER = {
  // accept all gesture handler prop types plus native wrapper specific ones
  ...NativeViewGestureHandler.propTypes,
  // we want to pass gesture event handlers if registered
  onGestureHandlerEvent: PropTypes.func,
  onGestureHandlerStateChange: PropTypes.func,
};

function createNativeWrapper(Component, config = {}) {
  class ComponentWrapper extends React.Component {
    static propTypes = {
      ...Component.propTypes,
    };

    _refHandler = node => {
      // bind native component's methods
      for (let methodName in node) {
        const method = node[methodName];
        if (
          !methodName.startsWith('_') && // private methods
          !methodName.startsWith('component') && // lifecycle methods
          !NATIVE_WRAPPER_BIND_BLACKLIST.has(methodName) && // other
          typeof method === 'function' &&
          this[methodName] === undefined
        ) {
          this[methodName] = method;
        }
      }
    };

    render() {
      // filter out props that should be passed to gesture handler wrapper
      const gestureHandlerProps = Object.keys(this.props).reduce(
        (props, key) => {
          if (key in NATIVE_WRAPPER_PROPS_FILTER) {
            props[key] = this.props[key];
          }
          return props;
        },
        { ...config } // watch out not to modify config
      );
      return (
        <NativeViewGestureHandler {...gestureHandlerProps}>
          <Component {...this.props} ref={this._refHandler} />
        </NativeViewGestureHandler>
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
const WrappedViewPagerAndroid = createNativeWrapper(ViewPagerAndroid, {
  disallowInterruption: true,
});
const WrappedDrawerLayoutAndroid = createNativeWrapper(DrawerLayoutAndroid, {
  disallowInterruption: true,
});
WrappedDrawerLayoutAndroid.positions = DrawerLayoutAndroid.positions;

State.print = state => {
  const keys = Object.keys(State);
  for (let i = 0; i < keys.length; i++) {
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
  static propTypes = {
    ...RawButton.propTypes,
    onPress: PropTypes.func,
    onActiveStateChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this._lastActive = false;
  }

  _handleEvent = ({ nativeEvent }) => {
    const { state, oldState, pointerInside } = nativeEvent;
    const active = pointerInside && state === State.ACTIVE;

    if (active !== this._lastActive && this.props.onActiveStateChange) {
      this.props.onActiveStateChange(active);
    }

    if (
      oldState === State.ACTIVE &&
      state !== State.CANCELLED &&
      this._lastActive &&
      this.props.onPress
    ) {
      this.props.onPress(active);
    }

    this._lastActive = active;
  };

  // Normally, the parent would execute it's handler first,
  // then forward the event to listeners. However, here our handler
  // is virtually only forwarding events to listeners, so we reverse the order
  // to keep the proper order of the callbacks (from "raw" ones to "processed").
  _onHandlerStateChange = e => {
    this.props.onHandlerStateChange && this.props.onHandlerStateChange(e);
    this._handleEvent(e);
  };

  _onGestureEvent = e => {
    this.props.onGestureEvent && this.props.onGestureEvent(e);
    this._handleEvent(e);
  };

  render() {
    const { style, ...rest } = this.props;

    return (
      <RawButton
        style={[{ overflow: 'hidden' }, style]}
        {...rest}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}
      />
    );
  }
}

const AnimatedBaseButton = Animated.createAnimatedComponent(BaseButton);

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

  _onActiveStateChange = active => {
    if (Platform.OS !== 'android') {
      this._opacity.setValue(active ? this.props.activeOpacity : 0);
    }

    this.props.onActiveStateChange && this.props.onActiveStateChange(active);
  };

  render() {
    const { children, ...rest } = this.props;

    return (
      <BaseButton {...rest} onActiveStateChange={this._onActiveStateChange}>
        <Animated.View
          style={[
            btnStyles.underlay,
            { opacity: this._opacity },
            { backgroundColor: this.props.underlayColor },
          ]}
        />
        {children}
      </BaseButton>
    );
  }
}

class BorderlessButton extends React.Component {
  static propTypes = {
    ...BaseButton.propTypes,
    borderless: PropTypes.bool,
  };

  static defaultProps = {
    activeOpacity: 0.3,
    borderless: true,
  };

  constructor(props) {
    super(props);
    this._opacity = new Animated.Value(1);
  }

  _onActiveStateChange = active => {
    if (Platform.OS !== 'android') {
      this._opacity.setValue(active ? this.props.activeOpacity : 1);
    }

    this.props.onActiveStateChange && this.props.onActiveStateChange(active);
  };

  render() {
    const { children, style, ...rest } = this.props;

    return (
      <AnimatedBaseButton
        {...rest}
        onActiveStateChange={this._onActiveStateChange}
        style={[style, Platform.OS === 'ios' && { opacity: this._opacity }]}>
        {children}
      </AnimatedBaseButton>
    );
  }
}

/* Other */

const FlatListWithGHScroll = props => (
  <FlatList
    {...props}
    renderScrollComponent={props => <WrappedScrollView {...props} />}
  />
);

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
  FlingGestureHandler,
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
  /* Other */
  FlatListWithGHScroll as FlatList,
  gestureHandlerRootHOC,
  Directions,
};
