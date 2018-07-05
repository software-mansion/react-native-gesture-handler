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

export default class Example extends Component {
  render() {
    return (
      <View style={styles.scrollView}>
        <Animated.View>
          <DraggableBox boxStyle={{ backgroundColor: 'plum' }} />
          <DraggableBox
            boxStyle={{ backgroundColor: 'lightgoldenrodyellow' }}
          />
        </Animated.View>
        <LoremIpsum />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
