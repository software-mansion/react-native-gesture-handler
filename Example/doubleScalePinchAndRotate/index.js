import React, { Component } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import {
  PanGestureHandler,
  ScrollView,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../config';
import { LoremIpsum } from '../common';
import { DraggableBox } from '../draggable/index';
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
