import React from 'react';
import { View, Text } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureType,
  HoverEffect,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

function useHover(color: string): [GestureType, any] {
  const hovered = useSharedValue(false);
  const style = useAnimatedStyle(() => ({
    opacity: hovered.value ? 0.5 : 1,
  }));

  return [
    Gesture.Hover()
      .onBegin(() => {
        hovered.value = true;
        console.log('hover begin', color);
      })
      .onStart(() => {
        console.log('hover start', color);
      })
      .onEnd((_, s) => {
        console.log('hover end', color, 'failed', !s);
      })
      .onFinalize(() => {
        hovered.value = false;
        console.log('hover finalize', color);
      })
      .effect(HoverEffect.LIFT),
    style,
  ];
}

export default function Example() {
  const [hover1, style1] = useHover('red');

  const [hover2, style2] = useHover('green');

  const [hover3, style3] = useHover('red');

  const [hover4, style4] = useHover('green');

  const [hover5, style5] = useHover('blue');
  // hover1.simultaneousWithExternalGesture(hover2);
  // hover4.simultaneousWithExternalGesture(hover5);

  return (
    <View style={{ flex: 1 }}>
      <Text>Parent & child</Text>
      <GestureDetector gesture={hover1}>
        <Animated.View
          style={[
            {
              width: 200,
              height: 200,
              backgroundColor: 'red',
              elevation: 8,
            },
            style1,
          ]}>
          <GestureDetector gesture={hover2}>
            <Animated.View
              style={[
                {
                  width: 100,
                  height: 100,
                  backgroundColor: 'green',
                  elevation: 8,
                },
                style2,
              ]}
            />
          </GestureDetector>
        </Animated.View>
      </GestureDetector>

      <View style={{ height: 50 }} />

      <Text>Absolute positioning</Text>
      <View style={{ width: 200, height: 200 }}>
        <GestureDetector gesture={hover3}>
          <Animated.View
            style={[
              {
                width: 200,
                height: 200,
                backgroundColor: 'red',
                // zIndex: 10,
              },
              style3,
            ]}
          />
        </GestureDetector>
        <GestureDetector gesture={hover5}>
          <Animated.View
            style={[
              {
                width: 200,
                height: 200,
                backgroundColor: 'blue',
                position: 'absolute',
              },
              style5,
            ]}
          />
        </GestureDetector>

        <GestureDetector gesture={hover4}>
          <Animated.View
            style={[
              {
                width: 100,
                height: 100,
                backgroundColor: 'green',
                position: 'absolute',
                // zIndex: 80,
              },
              style4,
            ]}
          />
        </GestureDetector>
      </View>
    </View>
  );
}
