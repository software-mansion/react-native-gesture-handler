import React from 'react';
import {
  HoverEffect,
  NativeDetector,
  useHover,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Platform, StyleSheet } from 'react-native';

// eslint-disable-next-line import-x/no-commonjs, @typescript-eslint/no-var-requires
const SVG = require('../../new_api/hoverable_icons/svg.png');
// eslint-disable-next-line import-x/no-commonjs, @typescript-eslint/no-var-requires
const FREEZE = require('../../new_api/hoverable_icons/freeze.png');
// eslint-disable-next-line import-x/no-commonjs, @typescript-eslint/no-var-requires
const REA = require('../../new_api/hoverable_icons/rea.png');
// eslint-disable-next-line import-x/no-commonjs, @typescript-eslint/no-var-requires
const GH = require('../../new_api/hoverable_icons/gh.png');
// eslint-disable-next-line import-x/no-commonjs, @typescript-eslint/no-var-requires
const SCREENS = require('../../new_api/hoverable_icons/screens.png');

const images = [GH, REA, SCREENS, SVG, FREEZE];
const SIZE = 100;

function BoxReanimated(props: { source: any }) {
  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const targetOffsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const targetOffsetY = useSharedValue(0);

  useFrameCallback((frame) => {
    offsetX.value +=
      ((targetOffsetX.value - offsetX.value) *
        0.15 *
        (frame.timeSincePreviousFrame ?? 1)) /
      16;
    offsetY.value +=
      ((targetOffsetY.value - offsetY.value) *
        0.15 *
        (frame.timeSincePreviousFrame ?? 1)) /
      16;
  });

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  const hover = useHover({
    onBegin: () => {
      'worklet';
      scale.value = withTiming(1.15, { duration: 100 });
    },
    onUpdate: (e) => {
      'worklet';
      const oX = e.handlerData.x - SIZE / 2;
      const oY = e.handlerData.y - SIZE / 2;

      targetOffsetX.value = Math.pow(Math.abs(oX), 0.3) * Math.sign(oX);
      targetOffsetY.value = Math.pow(Math.abs(oY), 0.3) * Math.sign(oY);
    },
    onFinalize: () => {
      'worklet';
      scale.value = withTiming(1, { duration: 100 });
      targetOffsetX.value = 0;
      targetOffsetY.value = 0;
    },
  });

  return (
    <NativeDetector gesture={hover}>
      <Animated.View style={{ overflow: 'visible' }}>
        <Animated.Image source={props.source} style={[style, styles.image]} />
      </Animated.View>
    </NativeDetector>
  );
}

function BoxNative(props: { source: any }) {
  const hover = useHover({
    hoverEffect: HoverEffect.LIFT,
  });

  return (
    <NativeDetector gesture={hover}>
      <Animated.Image source={props.source} style={styles.image} />
    </NativeDetector>
  );
}

export default function Example() {
  const BoxComponent = Platform.OS === 'ios' ? BoxNative : BoxReanimated;

  return (
    <Animated.View style={styles.container}>
      <Animated.View style={{ flexDirection: 'row', overflow: 'visible' }}>
        {images.map((source, index) => (
          <BoxComponent key={index} source={source} />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    overflow: 'visible',
    width: SIZE,
    height: SIZE,
    marginHorizontal: 8,
  },
});
