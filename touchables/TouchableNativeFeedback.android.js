import TouchableWithoutFeedback from './TouchableWithoutFeedback';
import { BaseButton } from '../GestureHandler';
import React from 'react';

/**
 * TouchableNativeFeedback behaves slightly different than RN's TouchableNativeFeedback.
 * There's small difference with handling long press ripple since RN's implementation calls
 * ripple animation via bridge. This solution leaves all animations' handling for native components so
 * it follows native behaviours.
 */
export default class TouchableNativeFeedback extends TouchableWithoutFeedback {
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
    ...TouchableWithoutFeedback.defaultProps,
    useForeground: true,
  };

  renderChildren(children) {
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
    return (
      <BaseButton
        style={this.props.style}
        foreground={this.props.useForeground}
        {...extraProps}>
        {children}
      </BaseButton>
    );
  }
}
