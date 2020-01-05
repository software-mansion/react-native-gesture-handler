import React, { Component } from 'react';
import { Text } from 'react-native';

class Example extends Component {
  static platforms = ['ios', 'android'];
  render() {
    return <Text>Sorry, this demo is not available on web</Text>;
  }
}

export const ComboWithGHScroll = Example;
export const ComboWithRNScroll = Example;
