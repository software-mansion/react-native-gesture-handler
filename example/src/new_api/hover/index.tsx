import React from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function Example() {
  const hover1 = Gesture.Hover()
    .onStart(() => {
      console.log('hover start red');
    })
    .onFinalize(() => {
      console.log('hover end red');
    });
  const hover2 = Gesture.Hover()
    .onStart(() => {
      console.log('hover start green');
    })
    .onFinalize(() => {
      console.log('hover end green');
    });
  const hover3 = Gesture.Hover()
    .onStart(() => {
      console.log('hover start red');
    })
    .onFinalize(() => {
      console.log('hover end red');
    });
  const hover4 = Gesture.Hover()
    .onStart(() => {
      console.log('hover start green');
    })
    .onFinalize(() => {
      console.log('hover end green');
    });
  const hover5 = Gesture.Hover()
    .onStart(() => {
      console.log('hover start blue');
    })
    .onFinalize(() => {
      console.log('hover end blue');
    });
  hover1.simultaneousWithExternalGesture(hover2);
  hover4.simultaneousWithExternalGesture(hover5);

  return (
    <View style={{ flex: 1 }}>
      <Text>Parent & child</Text>
      <GestureDetector gesture={hover1}>
        <View
          style={{
            width: 200,
            height: 200,
            backgroundColor: 'red',
            elevation: 8,
          }}>
          <GestureDetector gesture={hover2}>
            <View
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'green',
                elevation: 8,
              }}
            />
          </GestureDetector>
        </View>
      </GestureDetector>

      <View style={{ height: 50 }} />

      <Text>Absolute positioning</Text>
      <View style={{ width: 200, height: 200 }}>
        <GestureDetector gesture={hover3}>
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: 'red',
              // zIndex: 10,
            }}
          />
        </GestureDetector>
        <GestureDetector gesture={hover5}>
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: 'blue',
              position: 'absolute',
            }}
          />
        </GestureDetector>

        <GestureDetector gesture={hover4}>
          <View
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'green',
              position: 'absolute',
              // zIndex: 80,
            }}
          />
        </GestureDetector>
      </View>
    </View>
  );
}
