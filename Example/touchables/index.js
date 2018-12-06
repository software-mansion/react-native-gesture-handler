import React, { Component } from 'react';
import { TouchableHighlight as RNTouchableHighlight, View } from 'react-native';
import { TouchableHighlight } from './Touchables';

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
        <RNTouchableHighlight
          onPress={() => console.warn('[RNTWF] onPress')}
          onPressIn={() => console.warn('[RNTWF] onPressIn')}
          onPressOut={() => console.warn('[RNTWF] onPressOut')}
          onLongPress={() => console.warn('[RNTWF] onLongPress')}>
          <View
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'red',
            }}
          />
        </RNTouchableHighlight>

        <TouchableHighlight
          onPress={() => console.warn('[GHTWF] onPress')}
          onPressIn={() => console.warn('[GHTWF] onPressIn')}
          onPressOut={() => console.warn('[GHTWF] onPressOut')}
          onLongPress={() => console.warn('[GHTWF] onLongPress')}>
          <View
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'red',
            }}
          />
        </TouchableHighlight>
      </View>
    );
  }
}
