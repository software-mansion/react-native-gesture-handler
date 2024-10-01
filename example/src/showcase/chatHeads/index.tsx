import React, { Component } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';

import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

const USE_NATIVE_DRIVER = false;

const START_X = 0;
const START_Y = 0;

type TrackingState = {
  width: number;
  height: number;
};

class Tracking extends Component<Record<string, unknown>, TrackingState> {
  private dragX: Animated.Value;
  private transX: Animated.Value;
  private follow1x: Animated.Value;
  private follow2x: Animated.Value;
  private dragY: Animated.Value;
  private transY: Animated.Value;
  private follow1y: Animated.Value;
  private follow2y: Animated.Value;
  private onGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  private lastOffset: { x: number; y: number };
  constructor(props: Record<string, unknown>) {
    super(props);

    this.state = { width: 0, height: 0 };

    const tension = 0.8;
    const friction = 3;

    this.dragX = new Animated.Value(START_X);
    this.transX = new Animated.Value(START_X);
    this.follow1x = new Animated.Value(START_X);
    this.follow2x = new Animated.Value(START_X);
    Animated.spring(this.transX, {
      useNativeDriver: USE_NATIVE_DRIVER,
      toValue: this.dragX,
      tension,
      friction,
    }).start();
    Animated.spring(this.follow1x, {
      useNativeDriver: USE_NATIVE_DRIVER,
      toValue: this.transX,
      tension,
      friction,
    }).start();
    Animated.spring(this.follow2x, {
      useNativeDriver: USE_NATIVE_DRIVER,
      toValue: this.follow1x,
      tension,
      friction,
    }).start();

    this.dragY = new Animated.Value(START_Y);
    this.transY = new Animated.Value(START_Y);
    this.follow1y = new Animated.Value(START_Y);
    this.follow2y = new Animated.Value(START_Y);
    Animated.spring(this.transY, {
      useNativeDriver: USE_NATIVE_DRIVER,
      toValue: this.dragY,
      tension,
      friction,
    }).start();
    Animated.spring(this.follow1y, {
      useNativeDriver: USE_NATIVE_DRIVER,
      toValue: this.transY,
      tension,
      friction,
    }).start();
    Animated.spring(this.follow2y, {
      useNativeDriver: USE_NATIVE_DRIVER,
      toValue: this.follow1y,
      tension,
      friction,
    }).start();

    this.onGestureEvent = Animated.event(
      [
        {
          nativeEvent: { translationX: this.dragX, translationY: this.dragY },
        },
      ],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );

    this.lastOffset = { x: START_X, y: START_Y };
  }
  private onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { height, width } = this.state;

      const posX = this.lastOffset.x + event.nativeEvent.translationX;
      const posY = this.lastOffset.y + event.nativeEvent.translationY;

      const distFromTop = posY;
      const distFromBottom = height - posY - BOX_SIZE;
      const distFromLeft = posX;
      const distFromRight = width - posX - BOX_SIZE;

      this.lastOffset = { x: posX, y: posY };

      this.dragX.flattenOffset();
      this.dragY.flattenOffset();

      const minDist = Math.min(
        distFromTop,
        distFromBottom,
        distFromLeft,
        distFromRight
      );
      if (distFromTop === minDist) {
        this.dragY.setValue(-BOX_SIZE / 4);
        this.lastOffset.y = -BOX_SIZE / 4;
      } else if (distFromBottom === minDist) {
        this.dragY.setValue(height - BOX_SIZE / 2);
        this.lastOffset.y = height - BOX_SIZE / 2;
      } else if (distFromLeft === minDist) {
        this.dragX.setValue(-BOX_SIZE / 2);
        this.lastOffset.x = -BOX_SIZE / 2;
      } else if (distFromRight === minDist) {
        this.dragX.setValue(width - BOX_SIZE / 2);
        this.lastOffset.x = width - BOX_SIZE / 2;
      }

      this.dragX.extractOffset();
      this.dragY.extractOffset();
    }
  };
  private onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    this.setState({ width, height });
  };
  render() {
    return (
      <View
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        onLayout={this.onLayout}>
        <Animated.Image
          style={[
            styles.box,
            { marginLeft: 10, marginTop: 10 },
            {
              transform: [
                { translateX: this.follow2x },
                { translateY: this.follow2y },
              ],
            },
          ]}
          source={{
            uri: 'https://avatars0.githubusercontent.com/u/379606?v=4&s=460',
          }}
        />
        <Animated.Image
          style={[
            styles.box,
            { marginLeft: 5, marginTop: 5 },
            {
              transform: [
                { translateX: this.follow1x },
                { translateY: this.follow1y },
              ],
            },
          ]}
          source={{
            uri: 'https://avatars3.githubusercontent.com/u/90494?v=4&s=460',
          }}
        />

        <PanGestureHandler
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onHandlerStateChange}>
          <Animated.Image
            style={[
              styles.box,
              {
                transform: [
                  { translateX: this.transX },
                  { translateY: this.transY },
                ],
              },
            ]}
            source={{
              uri: 'https://avatars3.githubusercontent.com/u/726445?v=4&s=460',
            }}
          />
        </PanGestureHandler>
      </View>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Tracking />
      </View>
    );
  }
}

const BOX_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    position: 'absolute',
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderColor: '#F5FCFF',
    backgroundColor: 'plum',
    borderRadius: BOX_SIZE / 2,
  },
});
