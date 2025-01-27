import { Platform, ColorValue } from 'react-native';
import * as React from 'react';
import { Component } from 'react';
import GenericTouchable from './GenericTouchable';
import {
  TouchableNativeFeedbackProps,
  TouchableNativeFeedbackExtraProps,
} from './TouchableNativeFeedbackProps';

/**
 * @deprecated TouchableNativeFeedback will be removed in the future version of Gesture Handler.
 *
 * TouchableNativeFeedback behaves slightly different than RN's TouchableNativeFeedback.
 * There's small difference with handling long press ripple since RN's implementation calls
 * ripple animation via bridge. This solution leaves all animations' handling for native components so
 * it follows native behaviours.
 */
export default class TouchableNativeFeedback extends Component<TouchableNativeFeedbackProps> {
  static defaultProps = {
    ...GenericTouchable.defaultProps,
    useForeground: true,
    extraButtonProps: {
      // Disable hiding ripple on Android
      rippleColor: null,
    },
  };

  // Could be taken as RNTouchableNativeFeedback.SelectableBackground etc. but the API may change
  static SelectableBackground = (rippleRadius?: number) => ({
    type: 'ThemeAttrAndroid',
    // I added `attribute` prop to clone the implementation of RN and be able to use only 2 types
    attribute: 'selectableItemBackground',
    rippleRadius,
  });
  static SelectableBackgroundBorderless = (rippleRadius?: number) => ({
    type: 'ThemeAttrAndroid',
    attribute: 'selectableItemBackgroundBorderless',
    rippleRadius,
  });
  static Ripple = (
    color: ColorValue,
    borderless: boolean,
    rippleRadius?: number
  ) => ({
    type: 'RippleAndroid',
    color,
    borderless,
    rippleRadius,
  });

  static canUseNativeForeground = () =>
    Platform.OS === 'android' && Platform.Version >= 23;

  getExtraButtonProps() {
    const extraProps: TouchableNativeFeedbackExtraProps = {};
    const { background } = this.props;
    if (background) {
      // I changed type values to match those used in RN
      // TODO(TS): check if it works the same as previous implementation - looks like it works the same as RN component, so it should be ok
      if (background.type === 'RippleAndroid') {
        extraProps['borderless'] = background.borderless;
        extraProps['rippleColor'] = background.color;
      } else if (background.type === 'ThemeAttrAndroid') {
        extraProps['borderless'] =
          background.attribute === 'selectableItemBackgroundBorderless';
      }
      // I moved it from above since it should be available in all options
      extraProps['rippleRadius'] = background.rippleRadius;
    }
    extraProps['foreground'] = this.props.useForeground;
    return extraProps;
  }
  render() {
    const { style = {}, ...rest } = this.props;
    return (
      <GenericTouchable
        {...rest}
        style={style}
        extraButtonProps={this.getExtraButtonProps()}
      />
    );
  }
}
