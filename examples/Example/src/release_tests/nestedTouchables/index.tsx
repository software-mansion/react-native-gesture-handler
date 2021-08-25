import React from 'react';
import { View } from 'react-native';

import { TouchableOpacity } from 'react-native-gesture-handler';

export default function Example() {
  return (
    <View>
      <Boxes />
      <Boxes />
    </View>
  );
}

function Boxes() {
  return (
    <TouchableOpacity
      style={{ backgroundColor: 'red', width: 200, height: 200 }}>
      <TouchableOpacity
        style={{ backgroundColor: 'green', width: 100, height: 100 }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'blue',
            width: 50,
            height: 50,
          }}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
