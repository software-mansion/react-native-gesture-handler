function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import * as React from 'react';
import { Component } from 'react';
import GenericTouchable, { TOUCHABLE_STATE } from './GenericTouchable';
import { StyleSheet, View } from 'react-native';

/**
 * TouchableHighlight follows RN's implementation
 */
export default class TouchableHighlight extends Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "showUnderlay", () => {
      var _this$props$onShowUnd, _this$props;

      if (!this.hasPressHandler()) {
        return;
      }

      this.setState({
        extraChildStyle: {
          opacity: this.props.activeOpacity
        },
        extraUnderlayStyle: {
          backgroundColor: this.props.underlayColor
        }
      });
      (_this$props$onShowUnd = (_this$props = this.props).onShowUnderlay) === null || _this$props$onShowUnd === void 0 ? void 0 : _this$props$onShowUnd.call(_this$props);
    });

    _defineProperty(this, "hasPressHandler", () => this.props.onPress || this.props.onPressIn || this.props.onPressOut || this.props.onLongPress);

    _defineProperty(this, "hideUnderlay", () => {
      var _this$props$onHideUnd, _this$props2;

      this.setState({
        extraChildStyle: null,
        extraUnderlayStyle: null
      });
      (_this$props$onHideUnd = (_this$props2 = this.props).onHideUnderlay) === null || _this$props$onHideUnd === void 0 ? void 0 : _this$props$onHideUnd.call(_this$props2);
    });

    _defineProperty(this, "onStateChange", (_from, to) => {
      if (to === TOUCHABLE_STATE.BEGAN) {
        this.showUnderlay();
      } else if (to === TOUCHABLE_STATE.UNDETERMINED || to === TOUCHABLE_STATE.MOVED_OUTSIDE) {
        this.hideUnderlay();
      }
    });

    this.state = {
      extraChildStyle: null,
      extraUnderlayStyle: null
    };
  } // Copied from RN


  renderChildren() {
    if (!this.props.children) {
      return /*#__PURE__*/React.createElement(View, null);
    }

    const child = React.Children.only(this.props.children); // TODO: not sure if OK but fixes error

    return /*#__PURE__*/React.cloneElement(child, {
      style: StyleSheet.compose(child.props.style, this.state.extraChildStyle)
    });
  }

  render() {
    const {
      style = {},
      ...rest
    } = this.props;
    const {
      extraUnderlayStyle
    } = this.state;
    return /*#__PURE__*/React.createElement(GenericTouchable, _extends({}, rest, {
      style: [style, extraUnderlayStyle],
      onStateChange: this.onStateChange
    }), this.renderChildren());
  }

}

_defineProperty(TouchableHighlight, "defaultProps", { ...GenericTouchable.defaultProps,
  activeOpacity: 0.85,
  delayPressOut: 100,
  underlayColor: 'black'
});
//# sourceMappingURL=TouchableHighlight.js.map