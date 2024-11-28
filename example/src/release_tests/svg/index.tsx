import React from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Svg, { Circle } from 'react-native-svg';

export default function EmptyExample() {
  const tap = Gesture.Tap().onStart(() => console.log('clicked'));
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }]}>
      <View style={{ backgroundColor: 'tomato' }}>
        <Svg height="300" width="300">
          <GestureDetector gesture={tap}>
            <Circle
              cx="150"
              cy="150"
              r="140"
              stroke="green"
              strokeWidth="2.5"
              fill="green"
            />
          </GestureDetector>
        </Svg>
      </View>
      <Text>
        Clicks should only be registered while pressing on the green area.
        Pressing the tomato-colored area should not have an effect
      </Text>
    </View>
  );
}
