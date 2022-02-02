"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "PureNativeButton", {
  enumerable: true,
  get: function () {
    return _GestureHandlerButton.default;
  }
});
exports.BorderlessButton = exports.RectButton = exports.BaseButton = exports.RawButton = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _createNativeWrapper = _interopRequireDefault(require("../handlers/createNativeWrapper"));

var _GestureHandlerButton = _interopRequireDefault(require("./GestureHandlerButton"));

var _State = require("../State");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const RawButton = (0, _createNativeWrapper.default)(_GestureHandlerButton.default, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: false
});
exports.RawButton = RawButton;

class BaseButton extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "lastActive", void 0);

    _defineProperty(this, "handleEvent", ({
      nativeEvent
    }) => {
      const {
        state,
        oldState,
        pointerInside
      } = nativeEvent;
      const active = pointerInside && state === _State.State.ACTIVE;

      if (active !== this.lastActive && this.props.onActiveStateChange) {
        this.props.onActiveStateChange(active);
      }

      if (oldState === _State.State.ACTIVE && state !== _State.State.CANCELLED && this.lastActive && this.props.onPress) {
        this.props.onPress(active);
      }

      this.lastActive = active;
    });

    _defineProperty(this, "onHandlerStateChange", e => {
      var _this$props$onHandler, _this$props;

      (_this$props$onHandler = (_this$props = this.props).onHandlerStateChange) === null || _this$props$onHandler === void 0 ? void 0 : _this$props$onHandler.call(_this$props, e);
      this.handleEvent(e);
    });

    _defineProperty(this, "onGestureEvent", e => {
      var _this$props$onGesture, _this$props2;

      (_this$props$onGesture = (_this$props2 = this.props).onGestureEvent) === null || _this$props$onGesture === void 0 ? void 0 : _this$props$onGesture.call(_this$props2, e);
      this.handleEvent(e); // TODO: maybe it is not correct
    });

    this.lastActive = false;
  }

  render() {
    const {
      rippleColor,
      ...rest
    } = this.props;
    return /*#__PURE__*/React.createElement(RawButton, _extends({
      rippleColor: (0, _reactNative.processColor)(rippleColor)
    }, rest, {
      onGestureEvent: this.onGestureEvent,
      onHandlerStateChange: this.onHandlerStateChange
    }));
  }

}

exports.BaseButton = BaseButton;

const AnimatedBaseButton = _reactNative.Animated.createAnimatedComponent(BaseButton);

const btnStyles = _reactNative.StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
});

class RectButton extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "opacity", void 0);

    _defineProperty(this, "onActiveStateChange", active => {
      var _this$props$onActiveS, _this$props3;

      if (_reactNative.Platform.OS !== 'android') {
        this.opacity.setValue(active ? this.props.activeOpacity : 0);
      }

      (_this$props$onActiveS = (_this$props3 = this.props).onActiveStateChange) === null || _this$props$onActiveS === void 0 ? void 0 : _this$props$onActiveS.call(_this$props3, active);
    });

    this.opacity = new _reactNative.Animated.Value(0);
  }

  render() {
    const {
      children,
      style,
      ...rest
    } = this.props;

    const resolvedStyle = _reactNative.StyleSheet.flatten(style !== null && style !== void 0 ? style : {});

    return /*#__PURE__*/React.createElement(BaseButton, _extends({}, rest, {
      style: resolvedStyle,
      onActiveStateChange: this.onActiveStateChange
    }), /*#__PURE__*/React.createElement(_reactNative.Animated.View, {
      style: [btnStyles.underlay, {
        opacity: this.opacity,
        backgroundColor: this.props.underlayColor,
        borderRadius: resolvedStyle.borderRadius,
        borderTopLeftRadius: resolvedStyle.borderTopLeftRadius,
        borderTopRightRadius: resolvedStyle.borderTopRightRadius,
        borderBottomLeftRadius: resolvedStyle.borderBottomLeftRadius,
        borderBottomRightRadius: resolvedStyle.borderBottomRightRadius
      }]
    }), children);
  }

}

exports.RectButton = RectButton;

_defineProperty(RectButton, "defaultProps", {
  activeOpacity: 0.105,
  underlayColor: 'black'
});

class BorderlessButton extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "opacity", void 0);

    _defineProperty(this, "onActiveStateChange", active => {
      var _this$props$onActiveS2, _this$props4;

      if (_reactNative.Platform.OS !== 'android') {
        this.opacity.setValue(active ? this.props.activeOpacity : 1);
      }

      (_this$props$onActiveS2 = (_this$props4 = this.props).onActiveStateChange) === null || _this$props$onActiveS2 === void 0 ? void 0 : _this$props$onActiveS2.call(_this$props4, active);
    });

    this.opacity = new _reactNative.Animated.Value(1);
  }

  render() {
    const {
      children,
      style,
      ...rest
    } = this.props;
    return /*#__PURE__*/React.createElement(AnimatedBaseButton, _extends({}, rest, {
      onActiveStateChange: this.onActiveStateChange,
      style: [style, _reactNative.Platform.OS === 'ios' && {
        opacity: this.opacity
      }]
    }), children);
  }

}

exports.BorderlessButton = BorderlessButton;

_defineProperty(BorderlessButton, "defaultProps", {
  activeOpacity: 0.3,
  borderless: true
});
//# sourceMappingURL=GestureButtons.js.map