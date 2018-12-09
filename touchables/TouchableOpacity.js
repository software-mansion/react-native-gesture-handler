import {
  Animated,
  Easing,
  StyleSheet,
  View,
  ViewPropTypes,
} from 'react-native';
import TouchableWithoutFeedback, {
  TOUCHABLE_STATE,
} from './TouchableWithoutFeedback';
import React from 'react';
import PropTypes from 'prop-types';

/**
 * TouchableOpacity base timing animation which has been used in RN's core
 */
export default class TouchableOpacity extends TouchableWithoutFeedback {
  static defaultProps = {
    ...TouchableWithoutFeedback.defaultProps,
    // value copier from RN's implementation
    activeOpacity: 0.2,
  };

  static propTypes = {
    ...TouchableWithoutFeedback.propTypes,

    style: ViewPropTypes.style,
    activeOpacity: PropTypes.number,
  };

  // opacity is 1 one by default but could be overwritten
  getChildStyleOpacityWithDefault = () => {
    const childStyle = StyleSheet.flatten(this.props.style) || {};
    return childStyle.opacity == null ? 1 : childStyle.opacity;
  };

  opacity = new Animated.Value(this.getChildStyleOpacityWithDefault());
  style = {
    ...this.props.style,
    opacity: this.opacity,
  };

  // Handle case when touchable is empty, but LongPressGesture Handler has to be
  // binded wit some view.
  renderChildren(children) {
    return children ? children : <View />;
  }

  setOpacityTo = (value, duration) => {
    Animated.timing(this.opacity, {
      toValue: value,
      duration: duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  // Override
  onStateChange = (from, to) => {
    if (to === TOUCHABLE_STATE.BEGAN) {
      this.setOpacityTo(this.props.activeOpacity, 0);
    } else if (
      to === TOUCHABLE_STATE.UNDETERMINED ||
      to === TOUCHABLE_STATE.MOVED_OUTSIDE
    ) {
      this.setOpacityTo(this.getChildStyleOpacityWithDefault(), 150);
    }
  };
}
