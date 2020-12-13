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
  private _touchX: Animated.Value;
  private _translateX: Animated.AnimatedAddition;
  private _translateY: Animated.Value;
  constructor(props: {}) {
    super(props);
    this._touchX = new Animated.Value(windowWidth / 2 - circleRadius);
    this._translateX = Animated.add(
      this._touchX,
      new Animated.Value(-circleRadius)
    );
    this._translateY = new Animated.Value(0);
  }

  _onHorizontalFlingHandlerStateChange = (
    { nativeEvent }: FlingGestureHandlerStateChangeEvent,
    offset: number
  ) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this._touchX, {
        // @ts-ignore private property
        toValue: this._touchX._value + offset,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };

  _onVerticalFlingHandlerStateChange = ({
    nativeEvent,
  }: FlingGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this._translateY, {
        // @ts-ignore private property
        toValue: this._translateY._value + 10,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };

  render() {
    return (
      <FlingGestureHandler
        direction={Directions.UP}
        numberOfPointers={2}
        onHandlerStateChange={this._onVerticalFlingHandlerStateChange}>
        <FlingGestureHandler
          direction={Directions.RIGHT | Directions.LEFT}
          onHandlerStateChange={(ev) =>
            this._onHorizontalFlingHandlerStateChange(ev, -10)
          }>
          <View style={styles.horizontalPan}>
            <Animated.View
              style={[
                styles.circle,
                {
                  transform: [
                    {
                      translateX: this._translateX,
                    },
                    {
                      translateY: this._translateY,
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
