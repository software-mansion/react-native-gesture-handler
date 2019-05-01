import React from 'react';
import {
  Animated,
  ScrollView,
  Switch,
  TextInput,
  ToolbarAndroid,
  DrawerLayoutAndroid,
  StyleSheet,
  FlatList,
  Platform,
  processColor,
} from 'react-native';
import PropTypes from 'prop-types';

import createHandler from './createHandler';
import GestureHandlerButton from './GestureHandlerButton';
import gestureHandlerRootHOC from './gestureHandlerRootHOC';

import Directions from './Directions';
import State from './State';
import PlatformConstants from './PlatformConstants';

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

const NativeViewGestureHandler = createHandler('NativeViewGestureHandler', {
  ...GestureHandlerPropTypes,
  shouldActivateOnStart: PropTypes.bool,
  disallowInterruption: PropTypes.bool,
});
const TapGestureHandler = createHandler(
  'TapGestureHandler',
  {
    ...GestureHandlerPropTypes,
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
    ...GestureHandlerPropTypes,
    numberOfPointers: PropTypes.number,
    direction: PropTypes.number,
  },
  {}
);

class ForceTouchFallback extends React.Component {
  componentDidMount() {
    console.warn(
      'ForceTouchGestureHandler is not available on this platform. Please use ForceTouchGestureHandler.forceTouchAvailable to conditionally render other components that would provide a fallback behavior specific to your usecase'
    );
  }
  render() {
    return this.props.children;
  }
}

const ForceTouchGestureHandler =
  PlatformConstants && PlatformConstants.forceTouchAvailable
    ? createHandler(
        'ForceTouchGestureHandler',
        {
          ...GestureHandlerPropTypes,
          minForce: PropTypes.number,
          maxForce: PropTypes.number,
          feedbackOnActivation: PropTypes.bool,
        },
        {}
      )
    : ForceTouchFallback;

ForceTouchGestureHandler.forceTouchAvailable =
  (PlatformConstants && PlatformConstants.forceTouchAvailable) || false;

const LongPressGestureHandler = createHandler(
  'LongPressGestureHandler',
  {
    ...GestureHandlerPropTypes,
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
    ...GestureHandlerPropTypes,
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
const PinchGestureHandler = createHandler(
  'PinchGestureHandler',
  GestureHandlerPropTypes,
  {}
);
const RotationGestureHandler = createHandler(
  'RotationGestureHandler',
  GestureHandlerPropTypes,
  {}
);

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

    static displayName = Component.displayName || "ComponentWrapper";

    _refHandler = node => {
      // bind native component's methods
      let source = node;
      while (source != null) {
        for (let methodName of Object.getOwnPropertyNames(source)) {
          if (
            !methodName.startsWith('_') && // private methods
            !methodName.startsWith('component') && // lifecycle methods
            !NATIVE_WRAPPER_BIND_BLACKLIST.has(methodName) && // other
            typeof source[methodName] === 'function' &&
            this[methodName] === undefined
          ) {
            if (source[methodName].prototype) {
              // determine if it's not bound already
              this[methodName] = source[methodName].bind(node);
            } else {
              this[methodName] = source[methodName];
            }
          }
        }
        source = Object.getPrototypeOf(source);
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
const WrappedSwitch = createNativeWrapper(Switch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});
const WrappedTextInput = createNativeWrapper(TextInput);

const WrappedToolbarAndroid = createNativeWrapper(ToolbarAndroid);
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

const RawButton = createNativeWrapper(GestureHandlerButton, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: false,
});

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
    const { style, rippleColor, ...rest } = this.props;

    return (
      <RawButton
        style={[{ overflow: 'hidden' }, style]}
        rippleColor={processColor(rippleColor)}
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

const FlatListWithGHScroll = React.forwardRef((props, ref) => (
  <FlatList
    ref={ref}
    {...props}
    renderScrollComponent={scrollProps => <WrappedScrollView {...scrollProps} />}
  />
));

export {
  WrappedScrollView as ScrollView,
  WrappedSwitch as Switch,
  WrappedTextInput as TextInput,
  WrappedToolbarAndroid as ToolbarAndroid,
  WrappedDrawerLayoutAndroid as DrawerLayoutAndroid,
  NativeViewGestureHandler,
  TapGestureHandler,
  FlingGestureHandler,
  ForceTouchGestureHandler,
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
  GestureHandlerButton as PureNativeButton,
  Directions,
  createNativeWrapper,
};
