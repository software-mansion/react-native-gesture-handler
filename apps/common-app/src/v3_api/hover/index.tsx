import React from 'react';
import { View, Text } from 'react-native';
import {
  NativeDetector,
  HoverEffect,
  useHover,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

function useColoredHover(color: string) {
  const hovered = useSharedValue(false);

  const style = useAnimatedStyle(() => ({
    opacity: hovered.value ? 0.5 : 1,
  }));

  const gesture = useHover({
    onBegin: () => {
      'worklet';
      hovered.value = true;
      console.log('hover begin', color);
    },
    onStart: () => {
      'worklet';
      console.log('hover start', color);
    },
    onEnd: (_, success) => {
      'worklet';
      console.log('hover end', color, 'failed', !success);
    },
    onFinalize: () => {
      'worklet';
      hovered.value = false;
      console.log('hover finalize', color);
    },
    hoverEffect: HoverEffect.LIFT,
  });

  return [gesture, style] as const;
}

export default function Example() {
  const [hover1, style1] = useColoredHover('red');

  const [hover2, style2] = useColoredHover('green');

  const [hover3, style3] = useColoredHover('red');

  const [hover4, style4] = useColoredHover('green');

  const [hover5, style5] = useColoredHover('blue');

  return (
    <View style={{ flex: 1 }}>
      <Text>Parent & child</Text>
      <NativeDetector gesture={hover1}>
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
          <NativeDetector gesture={hover2}>
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
          </NativeDetector>
        </Animated.View>
      </NativeDetector>

      <View style={{ height: 50 }} />

      <Text>Absolute positioning</Text>
      <View style={{ width: 200, height: 200 }}>
        <NativeDetector gesture={hover3}>
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
        </NativeDetector>
        <NativeDetector gesture={hover5}>
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
        </NativeDetector>

        <NativeDetector gesture={hover4}>
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
        </NativeDetector>
      </View>
    </View>
  );
}
