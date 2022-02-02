function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Platform } from 'react-native';
import * as React from 'react';
import { Component } from 'react';
import GenericTouchable from './GenericTouchable';

/**
 * TouchableNativeFeedback behaves slightly different than RN's TouchableNativeFeedback.
 * There's small difference with handling long press ripple since RN's implementation calls
 * ripple animation via bridge. This solution leaves all animations' handling for native components so
 * it follows native behaviours.
 */
export default class TouchableNativeFeedback extends Component {
  // could be taken as RNTouchableNativeFeedback.SelectableBackground etc. but the API may change
  getExtraButtonProps() {
    const extraProps = {};
    const {
      background
    } = this.props;

    if (background) {
      // I changed type values to match those used in RN
      // TODO(TS): check if it works the same as previous implementation - looks like it works the same as RN component, so it should be ok
      if (background.type === 'RippleAndroid') {
        extraProps['borderless'] = background.borderless;
        extraProps['rippleColor'] = background.color;
      } else if (background.type === 'ThemeAttrAndroid') {
        extraProps['borderless'] = background.attribute === 'selectableItemBackgroundBorderless';
      } // I moved it from above since it should be available in all options


      extraProps['rippleRadius'] = background.rippleRadius;
    }

    extraProps['foreground'] = this.props.useForeground;
    return extraProps;
  }

  render() {
    const {
      style = {},
      ...rest
    } = this.props;
    return /*#__PURE__*/React.createElement(GenericTouchable, _extends({}, rest, {
      style: style,
      extraButtonProps: this.getExtraButtonProps()
    }));
  }

}

_defineProperty(TouchableNativeFeedback, "defaultProps", { ...GenericTouchable.defaultProps,
  useForeground: true,
  extraButtonProps: {
    // Disable hiding ripple on Android
    rippleColor: null
  }
});

_defineProperty(TouchableNativeFeedback, "SelectableBackground", rippleRadius => ({
  type: 'ThemeAttrAndroid',
  // I added `attribute` prop to clone the implementation of RN and be able to use only 2 types
  attribute: 'selectableItemBackground',
  rippleRadius
}));

_defineProperty(TouchableNativeFeedback, "SelectableBackgroundBorderless", rippleRadius => ({
  type: 'ThemeAttrAndroid',
  attribute: 'selectableItemBackgroundBorderless',
  rippleRadius
}));

_defineProperty(TouchableNativeFeedback, "Ripple", (color, borderless, rippleRadius) => ({
  type: 'RippleAndroid',
  color,
  borderless,
  rippleRadius
}));

_defineProperty(TouchableNativeFeedback, "canUseNativeForeground", () => Platform.Version >= 23);
//# sourceMappingURL=TouchableNativeFeedback.android.js.map