import React, { Component, PropsWithChildren } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import {
  PanGestureHandler,
  RotationGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  RotationGestureHandlerGestureEvent,
  RotationGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../../../config';

class Snappable extends Component<PropsWithChildren<Record<string, unknown>>> {
  private onGestureEvent?: (event: PanGestureHandlerGestureEvent) => void;
  private transX: Animated.AnimatedInterpolation<number>;
  private dragX: Animated.Value;

  constructor(props: Record<string, unknown>) {
    super(props);
    this.dragX = new Animated.Value(0);
    this.transX = this.dragX.interpolate({
      inputRange: [-100, -50, 0, 50, 100],
      outputRange: [-30, -10, 0, 10, 30],
    });
    this.onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: this.dragX } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }

  private onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this.dragX, {
        velocity: event.nativeEvent.velocityX,
        tension: 10,
        friction: 2,
        toValue: 0,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };

  render() {
    const { children } = this.props;
    return (
      <PanGestureHandler
        {...this.props}
        maxPointers={1}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}>
        <Animated.View style={{ transform: [{ translateX: this.transX }] }}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

class Twistable extends Component<PropsWithChildren<unknown>> {
  private gesture: Animated.Value;
  private onGestureEvent?: (event: RotationGestureHandlerGestureEvent) => void;
  private rot: Animated.AnimatedInterpolation<number>;

  constructor(props: Record<string, unknown>) {
    super(props);
    this.gesture = new Animated.Value(0);

    this.rot = this.gesture
      .interpolate({
        inputRange: [-1.2, -1, -0.5, 0, 0.5, 1, 1.2],
        outputRange: [-0.52, -0.5, -0.3, 0, 0.3, 0.5, 0.52],
      })
      .interpolate({
        inputRange: [-100, 100],
        outputRange: ['-5700deg', '5700deg'],
      });

    this.onGestureEvent = Animated.event(
      [{ nativeEvent: { rotation: this.gesture } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }
  private onHandlerStateChange = (
    event: RotationGestureHandlerStateChangeEvent
  ) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this.gesture, {
        velocity: event.nativeEvent.velocity,
        tension: 10,
        friction: 0.2,
        toValue: 0,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };
  render() {
    const { children } = this.props;
    return (
      <RotationGestureHandler
        {...this.props}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}>
        <Animated.View style={{ transform: [{ rotate: this.rot }] }}>
          {children}
        </Animated.View>
      </RotationGestureHandler>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Snappable>
          <Twistable>
            <View style={styles.box} />
          </Twistable>
        </Snappable>
      </View>
    );
  }
}

const BOX_SIZE = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderColor: '#F5FCFF',
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: BOX_SIZE / 2,
  },
});
