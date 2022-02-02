"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactNative = require("react-native");

var _GenericTouchable = _interopRequireWildcard(require("./GenericTouchable"));

var React = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * TouchableOpacity bases on timing animation which has been used in RN's core
 */
class TouchableOpacity extends React.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "getChildStyleOpacityWithDefault", () => {
      const childStyle = _reactNative.StyleSheet.flatten(this.props.style) || {};
      return childStyle.opacity == null ? 1 : childStyle.opacity;
    });

    _defineProperty(this, "opacity", new _reactNative.Animated.Value(this.getChildStyleOpacityWithDefault()));

    _defineProperty(this, "setOpacityTo", (value, duration) => {
      _reactNative.Animated.timing(this.opacity, {
        toValue: value,
        duration: duration,
        easing: _reactNative.Easing.inOut(_reactNative.Easing.quad),
        useNativeDriver: false
      }).start();
    });

    _defineProperty(this, "onStateChange", (_from, to) => {
      if (to === _GenericTouchable.TOUCHABLE_STATE.BEGAN) {
        this.setOpacityTo(this.props.activeOpacity, 0);
      } else if (to === _GenericTouchable.TOUCHABLE_STATE.UNDETERMINED || to === _GenericTouchable.TOUCHABLE_STATE.MOVED_OUTSIDE) {
        this.setOpacityTo(this.getChildStyleOpacityWithDefault(), 150);
      }
    });
  }

  render() {
    const {
      style = {},
      ...rest
    } = this.props;
    return /*#__PURE__*/React.createElement(_GenericTouchable.default, _extends({}, rest, {
      style: [style, {
        opacity: this.opacity // TODO: fix this

      }],
      onStateChange: this.onStateChange
    }), this.props.children ? this.props.children : /*#__PURE__*/React.createElement(_reactNative.View, null));
  }

}

exports.default = TouchableOpacity;

_defineProperty(TouchableOpacity, "defaultProps", { ..._GenericTouchable.default.defaultProps,
  activeOpacity: 0.2
});
//# sourceMappingURL=TouchableOpacity.js.map