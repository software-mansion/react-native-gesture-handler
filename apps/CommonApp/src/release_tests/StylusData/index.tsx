import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const GH = require('../../new_api/hoverable_icons/gh.png');

export default function StylusData() {
  const scaleFactor = useSharedValue(0);
  const rotationXFactor = useSharedValue(0);
  const rotationYFactor = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin((e) => {
      if (!e.stylusData) {
        return;
      }

      scaleFactor.value = e.stylusData.pressure;
      rotationYFactor.value = e.stylusData.tiltX;
      rotationXFactor.value = e.stylusData.tiltY;
    })
    .onStart(() => {})
    .onChange((e) => {
      if (!e.stylusData) {
        return;
      }

      scaleFactor.value = e.stylusData.pressure;
      rotationYFactor.value = e.stylusData.tiltX;
      rotationXFactor.value = e.stylusData.tiltY;
    })
    .onFinalize((e) => {
      if (!e.stylusData) {
        return;
      }

      scaleFactor.value = withTiming(0, { duration: 250 });
      rotationXFactor.value = withTiming(0, { duration: 250 });
      rotationYFactor.value = withTiming(0, { duration: 250 });
    })
    .minDistance(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: 1 + scaleFactor.value },
        { rotateY: `${rotationYFactor.value}deg` },
        { rotateX: `${rotationXFactor.value}deg` },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.ball, animatedStyle]}>
          <Image
            source={GH}
            // @ts-ignore pointerEvents exists
            style={{ width: 180, height: 180, pointerEvents: 'none' }}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },

  ball: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderRadius: 100,
    backgroundColor: '#c8e3f7',

    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
