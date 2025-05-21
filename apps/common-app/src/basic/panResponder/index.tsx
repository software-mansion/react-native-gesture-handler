import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  PanResponder,
  I18nManager,
  GestureResponderEvent,
  PanResponderGestureState,
  GestureResponderHandlers,
} from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';

import { DraggableBox } from '../draggable';
import { LoremIpsum } from '../../common';

const CIRCLE_SIZE = 80;

type CircleStyles = {
  backgroundColor?: string;
  left?: number;
  top?: number;
};

// A clone of: https://github.com/facebook/react-native/blob/master/packages/rn-tester/js/examples/PanResponder/PanResponderExample.js
class PanResponderExample extends Component<{}, { style: CircleStyles }> {
  private panResponder: { panHandlers?: GestureResponderHandlers } = {};
  private previousLeft = 0;
  private previousTop = 0;

  constructor(props: Record<string, unknown>) {
    super(props);
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

    this.state = {
      style: {
        backgroundColor: 'green',
        left: this.previousLeft,
        top: this.previousTop,
      },
    };
  }

  render() {
    return (
      <View
        style={[styles.circle, this.state.style]}
        {...this.panResponder.panHandlers}
      />
    );
  }

  private highlight = () => {
    this.setState({
      style: {
        backgroundColor: 'blue',
        left: this.previousLeft,
        top: this.previousTop,
      },
    });
  };

  private unHighlight = () => {
    this.setState({
      style: {
        backgroundColor: 'green',
        left: this.previousLeft,
        top: this.previousTop,
      },
    });
  };

  private setPosition = (x: number, y: number) => {
    this.setState({
      style: {
        backgroundColor: 'blue',
        left: x,
        top: y,
      },
    });
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
    this.setPosition(
      this.previousLeft + gestureState.dx * (I18nManager.isRTL ? -1 : 1),
      this.previousTop + gestureState.dy
    );
  };

  private handlePanResponderEnd = (
    _e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    this.previousLeft += gestureState.dx * (I18nManager.isRTL ? -1 : 1);
    this.previousTop += gestureState.dy;
    this.unHighlight();
  };
}

export default class Example extends Component {
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
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    zIndex: 100,
  },
});
