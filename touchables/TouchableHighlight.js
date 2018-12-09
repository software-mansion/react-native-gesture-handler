import React from 'react';
import TouchableWithoutFeedback, {
  TOUCHABLE_STATE,
} from './TouchableWithoutFeedback';
import { StyleSheet, View } from 'react-native';

/**
 * TouchableHighlight follows RN's implementation
 */
export default class TouchableHighlight extends TouchableWithoutFeedback {
  static defaultProps = {
    ...TouchableWithoutFeedback.defaultProps,
    activeOpacity: 0.85,
    delayPressOut: 100,
    underlayColor: 'black',
  };

  static propTypes = {
    propTypes: {
      ...TouchableWithoutFeedback.propTypes,
      activeOpacity: PropTypes.number,
      underlayColor: PropTypes.string,
      style: View.propTypes.style,
      onShowUnderlay: PropTypes.func,
      onHideUnderlay: PropTypes.func,
    },
  };

  // Copied from RN
  state = {
    extraChildStyle: null,
    extraUnderlayStyle: {
      backgroundColor: 'black',
    },
  };

  // Copied from RN
  showUnderlay = () => {
    if (!this.hasPressHandler()) {
      return;
    }
    this.setState({
      extraChildStyle: {
        opacity: this.props.activeOpacity,
      },
      extraUnderlayStyle: {
        backgroundColor: this.props.underlayColor,
      },
    });
    this.props.onShowUnderlay && this.props.onShowUnderlay();
  };

  // Copied from RN
  hasPressHandler = () =>
    this.props.onPress ||
    this.props.onPressIn ||
    this.props.onPressOut ||
    this.props.onLongPress;

  // Copied from RN
  hideUnderlay = () => {
    this.setState({
      extraChildStyle: null,
      extraUnderlayStyle: null,
    });
    this.props.onHideUnderlay && this.props.onHideUnderlay();
  };

  renderChildren(children) {
    if (!children) {
      return <View />;
    }
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      style: StyleSheet.compose(
        child.props.style,
        this.state.extraChildStyle
      ),
    });
  }

  // override
  onStateChange = (from, to) => {
    if (to === TOUCHABLE_STATE.BEGAN) {
      this.showUnderlay();
    } else if (
      to === TOUCHABLE_STATE.UNDETERMINED ||
      to === TOUCHABLE_STATE.MOVED_OUTSIDE
    ) {
      this.hideUnderlay();
    }
  };
}
