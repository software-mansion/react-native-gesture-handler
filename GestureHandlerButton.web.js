import React from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

export default class RNGestureHandlerButton extends React.Component {
  render() {
    const { children, ...rest } = this.props;

    return (
      <TouchableWithoutFeedback accessibilityRole="button" {...rest}>
        <View>{children}</View>
      </TouchableWithoutFeedback>
    );
  }
}
