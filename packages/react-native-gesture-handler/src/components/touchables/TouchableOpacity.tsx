import {
  Animated,
  Easing,
  StyleSheet,
  View,
  TouchableOpacityProps as RNTouchableOpacityProps,
} from 'react-native';
import GenericTouchable, { TOUCHABLE_STATE } from './GenericTouchable';
import type { GenericTouchableProps } from './GenericTouchableProps';
import * as React from 'react';
import { Component } from 'react';

/**
 * @deprecated TouchableOpacity will be removed in the future version of Gesture Handler. Use Pressable instead.
 */
export type TouchableOpacityProps = RNTouchableOpacityProps &
  GenericTouchableProps & {
    useNativeAnimations?: boolean;
  };

/**
 * @deprecated TouchableOpacity will be removed in the future version of Gesture Handler. Use Pressable instead.
 *
 * TouchableOpacity bases on timing animation which has been used in RN's core
 */
export default class TouchableOpacity extends Component<TouchableOpacityProps> {
  static defaultProps = {
    ...GenericTouchable.defaultProps,
    activeOpacity: 0.2,
  };

  // Opacity is 1 one by default but could be overwritten
  getChildStyleOpacityWithDefault = () => {
    const childStyle = StyleSheet.flatten(this.props.style) || {};
    return childStyle.opacity == null
      ? 1
      : (childStyle.opacity.valueOf() as number);
  };

  opacity = new Animated.Value(this.getChildStyleOpacityWithDefault());

  setOpacityTo = (value: number, duration: number) => {
    Animated.timing(this.opacity, {
      toValue: value,
      duration: duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: this.props.useNativeAnimations ?? true,
    }).start();
  };

  onStateChange = (_from: number, to: number) => {
    if (to === TOUCHABLE_STATE.BEGAN) {
      this.setOpacityTo(this.props.activeOpacity!, 0);
    } else if (
      to === TOUCHABLE_STATE.UNDETERMINED ||
      to === TOUCHABLE_STATE.MOVED_OUTSIDE
    ) {
      this.setOpacityTo(this.getChildStyleOpacityWithDefault(), 150);
    }
  };

  render() {
    const { style = {}, ...rest } = this.props;
    return (
      <GenericTouchable
        {...rest}
        style={[
          style,
          {
            opacity: this.opacity as unknown as number, // TODO: fix this
          },
        ]}
        onStateChange={this.onStateChange}>
        {this.props.children ? this.props.children : <View />}
      </GenericTouchable>
    );
  }
}
