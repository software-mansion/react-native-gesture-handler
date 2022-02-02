function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import * as React from 'react';
import { Animated, Platform, processColor, StyleSheet } from 'react-native';
import createNativeWrapper from '../handlers/createNativeWrapper';
import GestureHandlerButton from './GestureHandlerButton';
import { State } from '../State';
export const RawButton = createNativeWrapper(GestureHandlerButton, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: false
});
export class BaseButton extends React.Component {
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
      const active = pointerInside && state === State.ACTIVE;

      if (active !== this.lastActive && this.props.onActiveStateChange) {
        this.props.onActiveStateChange(active);
      }

      if (oldState === State.ACTIVE && state !== State.CANCELLED && this.lastActive && this.props.onPress) {
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
      rippleColor: processColor(rippleColor)
    }, rest, {
      onGestureEvent: this.onGestureEvent,
      onHandlerStateChange: this.onHandlerStateChange
    }));
  }

}
const AnimatedBaseButton = Animated.createAnimatedComponent(BaseButton);
const btnStyles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
});
export class RectButton extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "opacity", void 0);

    _defineProperty(this, "onActiveStateChange", active => {
      var _this$props$onActiveS, _this$props3;

      if (Platform.OS !== 'android') {
        this.opacity.setValue(active ? this.props.activeOpacity : 0);
      }

      (_this$props$onActiveS = (_this$props3 = this.props).onActiveStateChange) === null || _this$props$onActiveS === void 0 ? void 0 : _this$props$onActiveS.call(_this$props3, active);
    });

    this.opacity = new Animated.Value(0);
  }

  render() {
    const {
      children,
      style,
      ...rest
    } = this.props;
    const resolvedStyle = StyleSheet.flatten(style !== null && style !== void 0 ? style : {});
    return /*#__PURE__*/React.createElement(BaseButton, _extends({}, rest, {
      style: resolvedStyle,
      onActiveStateChange: this.onActiveStateChange
    }), /*#__PURE__*/React.createElement(Animated.View, {
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

_defineProperty(RectButton, "defaultProps", {
  activeOpacity: 0.105,
  underlayColor: 'black'
});

export class BorderlessButton extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "opacity", void 0);

    _defineProperty(this, "onActiveStateChange", active => {
      var _this$props$onActiveS2, _this$props4;

      if (Platform.OS !== 'android') {
        this.opacity.setValue(active ? this.props.activeOpacity : 1);
      }

      (_this$props$onActiveS2 = (_this$props4 = this.props).onActiveStateChange) === null || _this$props$onActiveS2 === void 0 ? void 0 : _this$props$onActiveS2.call(_this$props4, active);
    });

    this.opacity = new Animated.Value(1);
  }

  render() {
    const {
      children,
      style,
      ...rest
    } = this.props;
    return /*#__PURE__*/React.createElement(AnimatedBaseButton, _extends({}, rest, {
      onActiveStateChange: this.onActiveStateChange,
      style: [style, Platform.OS === 'ios' && {
        opacity: this.opacity
      }]
    }), children);
  }

}

_defineProperty(BorderlessButton, "defaultProps", {
  activeOpacity: 0.3,
  borderless: true
});

export { default as PureNativeButton } from './GestureHandlerButton';
//# sourceMappingURL=GestureButtons.js.map