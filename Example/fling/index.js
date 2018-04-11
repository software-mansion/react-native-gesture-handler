import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  FlingGestureHandler,
  Directions,
  State,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../config';

const windowWidth = Dimensions.get('window').width;
const circleRadius = 30;

class Fling extends Component {
  constructor(props) {
    super(props);
    this._touchX = new Animated.Value(windowWidth / 2 - circleRadius);
    this._translateX = Animated.add(
      this._touchX,
      new Animated.Value(-circleRadius)
    );
  }

  _onTapHandlerStateChange = ({ nativeEvent }, offset) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this._touchX.setValue(this._touchX._value + offset);
    }
  };

  render() {
    return (
      <FlingGestureHandler
        direction={Directions.LEFT}
        minNumberOfTouches={2}
        onHandlerStateChange={(ev) => this._onTapHandlerStateChange(ev, 10)}
      >
        <FlingGestureHandler
          direction={Directions.RIGHT}
          onHandlerStateChange={(ev) => this._onTapHandlerStateChange(ev, -10)}
        >
          <View style={styles.horizontalPan}>
            <Animated.View
              style={[
                styles.circle,
                {
                  transform: [
                    {
                      translateX: this._translateX,
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
        <Fling/>
        <Text>
          Move left (with two fingers) or right (with one finger) and watch magic happens
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
