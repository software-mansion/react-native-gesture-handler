import React, { Component } from 'react';
import {
  TouchableHighlight as RNTouchableHighlight,
  TouchableOpacity as RNTouchableOpacity,
  TouchableNativeFeedback as RNTouchableNativeFeedback,
  View,
} from 'react-native';
import {
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from './Touchables';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';

export default class Touchables extends Component {
  render() {
    return (
      <View
        style={{
          justifyContent: 'space-between',
          padding: 100,
          height: '100%',
          alignItems: 'center',
        }}>
        <RNTouchableNativeFeedback
          onPress={() => console.warn('[RNTWF] onPress')}
          onPressIn={() => console.warn('[RNTWF] onPressIn')}
          onPressOut={() => console.warn('[RNTWF] onPressOut')}>
          <View
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'red',
            }}
          />
        </RNTouchableNativeFeedback>

        <TouchableWithoutFeedback
          onPress={() => console.warn('[GHTWF] onPress')}
          onPressIn={() => console.warn('[GHTWF] onPressIn')}
          onPressOut={() => console.warn('[GHTWF] onPressOut')}>
          <RectButton borderless={false}>
            <View
              style={{
                width: 100,
                backgroundColor: 'white',
                height: 100,
              }}
            />
          </RectButton>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
