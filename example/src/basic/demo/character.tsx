import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import {
  RotationGestureHandlerGestureEvent,
  RotationGestureHandler,
  RotationGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../../config';

export default class Character extends React.Component {
  private rotate: Animated.Value;
  private rotateStr: Animated.AnimatedInterpolation;
  private lastRotate: number;
  private onRotateGestureEvent: (
    event: RotationGestureHandlerGestureEvent
  ) => void;

  constructor(props: Record<string, unknown>) {
    super(props);

    this.rotate = new Animated.Value(0);
    this.rotateStr = this.rotate.interpolate({
      inputRange: [-100, 100],
      outputRange: ['-100rad', '100rad'],
    });
    this.lastRotate = 0;
    this.onRotateGestureEvent = Animated.event(
      [{ nativeEvent: { rotation: this.rotate } }],
      {
        useNativeDriver: USE_NATIVE_DRIVER,
      }
    );
  }

  private onRotateHandlerStateChange = (
    event: RotationGestureHandlerStateChangeEvent
  ) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this.lastRotate += event.nativeEvent.rotation;
      this.rotate.setOffset(this.lastRotate);
      this.rotate.setValue(0);
    }
  };

  render() {
    return (
      <RotationGestureHandler
        onGestureEvent={this.onRotateGestureEvent}
        onHandlerStateChange={this.onRotateHandlerStateChange}>
        <Animated.View
          style={[
            styles.wrapper,
            styles.char,
            { transform: [{ rotate: this.rotateStr }] },
          ]}>
          <svg width="200" height="200">
            <path
              d="M 40 75
              A 26 150 0 0 1 70 75
              M 130 75
              A 26 150 0 0 1 160 75
            "
              //M 40 120
              //A 30 25 0 1 0 160 120
              stroke="black"
              fill="transparent"
              strokeWidth="2"
            />
          </svg>
        </Animated.View>
      </RotationGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 100,
    backgroundColor: 'white',
  },
  char: {
    shadowColor: 'white',
    shadowOpacity: 1,
    shadowRadius: 20,
  },
});
