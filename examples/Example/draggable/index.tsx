import React, {Component} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

import {USE_NATIVE_DRIVER} from '../config';
import {LoremIpsum} from '../common';

type DraggableBoxProps = {
  minDist?: number;
  boxStyle?: any;
};

export class DraggableBox extends Component<DraggableBoxProps> {
  _translateX: Animated.Value;
  _translateY: Animated.Value;
  _lastOffset: {x: number; y: number};
  _onGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  constructor(props: DraggableBoxProps) {
    super(props);
    this._translateX = new Animated.Value(0);
    this._translateY = new Animated.Value(0);
    this._lastOffset = {x: 0, y: 0};
    this._onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this._translateX,
            translationY: this._translateY,
          },
        },
      ],
      {useNativeDriver: USE_NATIVE_DRIVER}
    );
  }
  _onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x += event.nativeEvent.translationX;
      this._lastOffset.y += event.nativeEvent.translationY;
      this._translateX.setOffset(this._lastOffset.x);
      this._translateX.setValue(0);
      this._translateY.setOffset(this._lastOffset.y);
      this._translateY.setValue(0);
    }
  };
  render() {
    return (
      <PanGestureHandler
        {...this.props}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}
        minDist={this.props.minDist}>
        <Animated.View
          style={[
            styles.box,
            {
              transform: [
                {translateX: this._translateX},
                {translateY: this._translateY},
              ],
            },
            this.props.boxStyle,
          ]}
        />
      </PanGestureHandler>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <View style={styles.scrollView}>
        <LoremIpsum words={40} />
        <DraggableBox />
        <LoremIpsum />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  box: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
  },
});
