import React, { Component } from 'react';
import { Animated, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  ScrollView,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../../../config';
import { LoremIpsum } from '../../../common';

type DraggableBoxProps = {
  minDist?: number;
  boxStyle?: StyleProp<ViewStyle>;
};

export class DraggableBox extends Component<DraggableBoxProps> {
  private translateX: Animated.Value;
  private translateY: Animated.Value;
  private lastOffset: { x: number; y: number };
  private onGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  constructor(props: DraggableBoxProps) {
    super(props);
    this.translateX = new Animated.Value(0);
    this.translateY = new Animated.Value(0);
    this.lastOffset = { x: 0, y: 0 };
    this.onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this.translateX,
            translationY: this.translateY,
          },
        },
      ],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }
  private onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this.lastOffset.x += event.nativeEvent.translationX;
      this.lastOffset.y += event.nativeEvent.translationY;
      this.translateX.setOffset(this.lastOffset.x);
      this.translateX.setValue(0);
      this.translateY.setOffset(this.lastOffset.y);
      this.translateY.setValue(0);
    }
  };
  render() {
    return (
      <PanGestureHandler
        {...this.props}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}
        minDist={this.props.minDist}>
        <Animated.View
          style={[
            styles.box,
            {
              transform: [
                { translateX: this.translateX },
                { translateY: this.translateY },
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
      <ScrollView style={styles.scrollView}>
        <LoremIpsum words={40} />
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
  box: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
  },
});
