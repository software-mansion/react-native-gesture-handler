import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  FlingGestureHandler,
  Directions,
  State,
  FlingGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../config';

const windowWidth = Dimensions.get('window').width;
const circleRadius = 30;

class Fling extends Component {
  private touchX: Animated.Value;
  private translateX: Animated.AnimatedAddition;
  private translateY: Animated.Value;
  constructor(props: {}) {
    super(props);
    this.touchX = new Animated.Value(windowWidth / 2 - circleRadius);
    this.translateX = Animated.add(
      this.touchX,
      new Animated.Value(-circleRadius)
    );
    this.translateY = new Animated.Value(0);
  }

  onHorizontalFlingHandlerStateChange = (
    { nativeEvent }: FlingGestureHandlerStateChangeEvent,
    offset: number
  ) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this.touchX, {
        // @ts-ignore private property
        toValue: this.touchX._value + offset,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };

  onVerticalFlingHandlerStateChange = ({
    nativeEvent,
  }: FlingGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this.translateY, {
        // @ts-ignore private property
        toValue: this.translateY._value + 10,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };

  render() {
    return (
      <FlingGestureHandler
        direction={Directions.UP}
        numberOfPointers={2}
        onHandlerStateChange={this.onVerticalFlingHandlerStateChange}>
        <FlingGestureHandler
          direction={Directions.RIGHT | Directions.LEFT}
          onHandlerStateChange={(ev) =>
            this.onHorizontalFlingHandlerStateChange(ev, -10)
          }>
          <View style={styles.horizontalPan}>
            <Animated.View
              style={[
                styles.circle,
                {
                  transform: [
                    {
                      translateX: this.translateX,
                    },
                    {
                      translateY: this.translateY,
                    },
                  ],
                },
              ]}
            />
          </View>
        </FlingGestureHandler>
      </FlingGestureHandler>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <View>
        <Fling />
        <Text>
          Move up (with two fingers) or right/left (with one finger) and watch
          magic happens
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  horizontalPan: {
    backgroundColor: '#f76f41',
    height: 300,
    justifyContent: 'center',
    marginVertical: 10,
  },
  circle: {
    backgroundColor: '#42a5f5',
    borderRadius: circleRadius,
    height: circleRadius * 2,
    width: circleRadius * 2,
  },
});
