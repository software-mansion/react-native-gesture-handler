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
    this._translateX.extractOffset();
    this._onPanGestureEvent = Animated.event(
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

  _onTapHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      // Once tap happened we set the position of the circle under the tapped spot
      this._translateX.setOffset(nativeEvent.x - circleRadius);
      this._translateX.setValue(0);
    }
  };

  _onPanHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      // Current dragX value is set as the translateX
      // After this method get called we want to reset value to 0 and
      // accumulate the translation in the value's offset. In order to
      // do that we call flattenOffset first to accumulate the sum in
      // base value and then call extractOffset to move the accumulated
      // base value to offset and reset base value to 0
      this._translateX.flattenOffset();
      this._translateX.extractOffset();
    }
  };

  render() {
    return (
      <TapGestureHandler
        id="tap"
        waitFor="pan"
        onGestureEvent={this._onTapGestureEvent}
        onHandlerStateChange={this._onTapHandlerStateChange}
        shouldCancelWhenOutside>
        <PanGestureHandler
          id="pan"
          minDeltaX={20}
          onGestureEvent={this._onPanGestureEvent}
          onHandlerStateChange={this._onPanHandlerStateChange}
          shouldCancelWhenOutside>
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
