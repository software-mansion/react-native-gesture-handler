import GenericTouchable from './GenericTouchable';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * TouchableNativeFeedback behaves slightly different than RN's TouchableNativeFeedback.
 * There's small difference with handling long press ripple since RN's implementation calls
 * ripple animation via bridge. This solution leaves all animations' handling for native components so
 * it follows native behaviours.
 */
export default class TouchableNativeFeedback extends Component {
  static SelectableBackground = () => ({ type: 'SelectableBackground' });
  static SelectableBackgroundBorderless = () => ({
    type: 'SelectableBackgroundBorderless',
  });
  static Ripple = (color, borderless) => ({
    type: 'Ripple',
    color,
    borderless,
  });

  static canUseNativeForeground = () =>
    Platform.OS === 'android' && Platform.Version >= 23;

  static defaultProps = {
    ...GenericTouchable.defaultProps,
    useForeground: true,
    extraButtonProps: {
      // Disable hiding ripple on Android
      rippleColor: null,
    },
  };

  static propTypes = {
    ...GenericTouchable.publicPropTypes,
    useForeground: PropTypes.bool,
    background: PropTypes.object,
    style: PropTypes.any,
  };

  getExtraButtonProps = () => {
    const extraProps = {};
    const { background } = this.props;
    if (background) {
      if (background.type === 'Ripple') {
        extraProps['borderless'] = background.borderless;
        extraProps['rippleColor'] = background.color;
      } else if (background.type === 'SelectableBackgroundBorderless') {
        extraProps['borderless'] = true;
      }
    }
    extraProps['foreground'] = this.props.useForeground;
    return extraProps;
  };
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
