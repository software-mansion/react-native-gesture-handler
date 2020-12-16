import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  PanResponder,
  I18nManager,
  GestureResponderEvent,
  PanResponderGestureState,
  Alert,
  GestureResponderHandlers,
} from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';

import { DraggableBox } from '../draggable';
import { LoremIpsum } from '../common';

const CIRCLE_SIZE = 80;

type CircleStyles = {
  backgroundColor?: string;
  left?: number;
  top?: number;
};

// A clone of: https://github.com/facebook/react-native/blob/master/packages/rn-tester/js/examples/PanResponder/PanResponderExample.js
class PanResponderExample extends Component {
  private panResponder: { panHandlers?: GestureResponderHandlers } = {};
  private previousLeft = 0;
  private previousTop = 0;
  private circleStyles: { style: CircleStyles } = {
    style: { left: 0, top: 0, backgroundColor: '#000' },
  };
  private circle: React.ElementRef<typeof View> | null = null;

  UNSAFE_componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderMove: this.handlePanResponderMove,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd,
    });
    this.previousLeft = 20;
    this.previousTop = 84;
    this.circleStyles = {
      style: {
        left: this.previousLeft,
        top: this.previousTop,
        backgroundColor: 'green',
      },
    };
  }

  componentDidMount() {
    this.updateNativeStyles();
  }

  render() {
    return (
      <View
        ref={(circle) => {
          this.circle = circle;
        }}
        style={styles.circle}
        {...this.panResponder.panHandlers}
      />
    );
  }

  private highlight = () => {
    this.circleStyles.style.backgroundColor = 'blue';
    this.updateNativeStyles();
  };

  private unHighlight = () => {
    this.circleStyles.style.backgroundColor = 'green';
    this.updateNativeStyles();
  };

  private updateNativeStyles = () => {
    this.circle?.setNativeProps(this.circleStyles);
  };

  private handleStartShouldSetPanResponder = (
    _e: GestureResponderEvent,
    _gestureState: PanResponderGestureState
  ) => {
    // Should we become active when the user presses down on the circle?
    return true;
  };

  private handleMoveShouldSetPanResponder = (
    _e: GestureResponderEvent,
    _gestureState: PanResponderGestureState
  ) => {
    // Should we become active when the user moves a touch over the circle?
    return true;
  };

  private handlePanResponderGrant = (
    _e: GestureResponderEvent,
    _gestureState: PanResponderGestureState
  ) => {
    this.highlight();
  };

  private handlePanResponderMove = (
    _e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    this.circleStyles.style.left =
      this.previousLeft + gestureState.dx * (I18nManager.isRTL ? -1 : 1);
    this.circleStyles.style.top = this.previousTop + gestureState.dy;
    this.updateNativeStyles();
  };

  private handlePanResponderEnd = (
    _e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    this.unHighlight();
    this.previousLeft += gestureState.dx * (I18nManager.isRTL ? -1 : 1);
    this.previousTop += gestureState.dy;
  };
}

export default class Example extends Component {
  onClick = () => {
    Alert.alert("I'm so touched");
  };
  render() {
    return (
      <ScrollView style={styles.scrollView}>
        <LoremIpsum words={40} />
        <PanResponderExample />
        <DraggableBox />
        <LoremIpsum />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    zIndex: 100,
  },
});
