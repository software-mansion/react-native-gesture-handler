import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import { PinchableBox } from '../scaleAndRotate/index';

export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <PinchableBox />
        <PinchableBox />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
