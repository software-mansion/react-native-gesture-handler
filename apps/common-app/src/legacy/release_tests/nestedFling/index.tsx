import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  FlingGestureHandler,
  Directions,
  State,
  FlingGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../../../config';

const windowWidth = Dimensions.get('window').width;
const circleRadius = 30;

class NestedFling extends Component {
  private touchX: Animated.Value;
  private translateX: Animated.AnimatedAddition<number>;
  private translateY: Animated.Value;
  constructor(props: Record<string, unknown>) {
    super(props);
    this.touchX = new Animated.Value(windowWidth / 2 - circleRadius);
    this.translateX = Animated.add(
      this.touchX,
      new Animated.Value(-circleRadius)
    );
    this.translateY = new Animated.Value(0);
  }

  private onHorizontalFlingHandlerStateChange = (
    { nativeEvent }: FlingGestureHandlerStateChangeEvent,
    offset: number
  ) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this.touchX, {
        // @ts-ignore private property
        toValue: Animated.add(this.touchX, offset),
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };

  private onVerticalFlingHandlerStateChange = ({
    nativeEvent,
  }: FlingGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this.translateY, {
        toValue: Animated.add(this.translateY, 10) as Animated.Value,
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
        <NestedFling />
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
