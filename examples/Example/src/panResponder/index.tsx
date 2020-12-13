import React, {Component} from 'react';
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

import {ScrollView} from 'react-native-gesture-handler';

import {DraggableBox} from '../draggable';
import {LoremIpsum} from '../common';

var CIRCLE_SIZE = 80;

type StyleType = {
  left: number;
  top: number;
  backgroundColor: string;
};

// A clone of: https://github.com/facebook/react-native/blob/master/RNTester/js/PanResponderExample.js
class PanResponderExample extends Component {
  private _panResponder: {panHandlers?: GestureResponderHandlers} = {};
  private _previousLeft = 0;
  private _previousTop = 0;
  private _circleStyles: {style: StyleType} = {
    style: {left: 0, top: 0, backgroundColor: '#000'},
  };
  private circle: any;

  UNSAFE_componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
    this._previousLeft = 20;
    this._previousTop = 84;
    this._circleStyles = {
      style: {
        left: this._previousLeft,
        top: this._previousTop,
        backgroundColor: 'green',
      },
    };
  }

  componentDidMount() {
    this._updateNativeStyles();
  }

  render() {
    return (
      <View
        ref={(circle) => {
          this.circle = circle;
        }}
        style={styles.circle}
        {...this._panResponder.panHandlers}
      />
    );
  }

  _highlight = () => {
    this._circleStyles.style.backgroundColor = 'blue';
    this._updateNativeStyles();
  };

  _unHighlight = () => {
    this._circleStyles.style.backgroundColor = 'green';
    this._updateNativeStyles();
  };

  _updateNativeStyles = () => {
    this.circle?.setNativeProps(this._circleStyles);
  };

  _handleStartShouldSetPanResponder = (
    _e: GestureResponderEvent,
    _gestureState: PanResponderGestureState
  ) => {
    // Should we become active when the user presses down on the circle?
    return true;
  };

  _handleMoveShouldSetPanResponder = (
    _e: GestureResponderEvent,
    _gestureState: PanResponderGestureState
  ) => {
    // Should we become active when the user moves a touch over the circle?
    return true;
  };

  _handlePanResponderGrant = (
    _e: GestureResponderEvent,
    _gestureState: PanResponderGestureState
  ) => {
    this._highlight();
  };

  _handlePanResponderMove = (
    _e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    this._circleStyles.style.left =
      this._previousLeft + gestureState.dx * (I18nManager.isRTL ? -1 : 1);
    this._circleStyles.style.top = this._previousTop + gestureState.dy;
    this._updateNativeStyles();
  };

  _handlePanResponderEnd = (
    _e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    this._unHighlight();
    this._previousLeft += gestureState.dx * (I18nManager.isRTL ? -1 : 1);
    this._previousTop += gestureState.dy;
  };
}

export default class Example extends Component {
  _onClick = () => {
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
