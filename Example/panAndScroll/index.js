import React, { Component } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
  ScrollView,
  State,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../config';
import { LoremIpsum } from '../common';

const windowWidth = Dimensions.get('window').width;
const circleRadius = 30;

export class TapOrPan extends Component {
  constructor(props) {
    super(props);
    this._translateX = new Animated.Value(windowWidth / 2 - circleRadius);
    this._lastX = 0;
    this._onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this._translateX,
          },
        },
      ],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }

  _onHandlerStateChange = event => {
    if (!event.nativeEvent || !event.nativeEvent.x) return;

    if (
      event.nativeEvent.oldState === State.ACTIVE ||
      event.nativeEvent.oldState === State.UNDETERMINED
    ) {
      this._lastX = event.nativeEvent.x;
      this._translateX.setOffset(this._lastX);
      this._translateX.setValue(0);
    }
  };

  render() {
    return (
      <TapGestureHandler
        id="tap"
        waitFor="pan"
        onHandlerStateChange={this._onHandlerStateChange}
        shouldCancelWhenOutside>
        <PanGestureHandler
          id="pan"
          minDeltaX={20}
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}
          shouldCancelWhenOutside>
          <View style={styles.horizontalPan}>
            <Animated.View
              style={[
                styles.circle,
                {
                  transform: [
                    {
                      translateX: Animated.add(
                        this._translateX,
                        new Animated.Value(-circleRadius)
                      ),
                    },
                  ],
                },
              ]}
            />
          </View>
        </PanGestureHandler>
      </TapGestureHandler>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <ScrollView waitFor={['tap', 'pan']}>
        <LoremIpsum words={150} />
        <TapOrPan />
        <LoremIpsum words={150} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  horizontalPan: {
    backgroundColor: '#f48fb1',
    height: 150,
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
