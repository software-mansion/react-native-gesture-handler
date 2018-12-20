import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * This implementation is a copy of react-native behavior.
 */
export default class DummyTouchableNativeFeedback extends Component {
  static SelectableBackground = () => ({});
  static SelectableBackgroundBorderless = () => ({});
  static Ripple = () => ({});
  static canUseNativeForeground = () => false;

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <Text style={styles.info}>
          TouchableNativeFeedback is not supported on this platform!
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    width: 300,
    backgroundColor: '#ffbcbc',
    borderWidth: 1,
    borderColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  info: {
    color: '#333333',
    margin: 20,
  },
});
