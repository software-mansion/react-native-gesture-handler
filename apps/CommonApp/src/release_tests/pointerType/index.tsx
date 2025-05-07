import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  PointerType,
} from 'react-native-gesture-handler';

const Colors = {
  Touch: '#7bbf98',
  Stylus: '#e9ac79',
  Mouse: '#7c6bab',
};

interface CircleProps {
  pointerTypeUpdater: React.Dispatch<React.SetStateAction<string>>;
}

function Circle({ pointerTypeUpdater }: CircleProps) {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const progress = useSharedValue(0);

  const currentColor = useSharedValue(Colors.Touch);
  const prevColor = useSharedValue(Colors.Touch);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translationX.value },
        { translateY: translationY.value },
      ],
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [prevColor.value, currentColor.value]
      ),
    };
  });

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      progress.value = 0;
      prevColor.value = currentColor.value;

      switch (e.pointerType) {
        case PointerType.TOUCH:
          currentColor.value = Colors.Touch;
          pointerTypeUpdater('Touch');
          break;
        case PointerType.STYLUS:
          currentColor.value = Colors.Stylus;
          pointerTypeUpdater('Stylus');
          break;
        case PointerType.MOUSE:
          currentColor.value = Colors.Mouse;
          pointerTypeUpdater('Mouse');
          break;
        default:
          break;
      }

      progress.value = withTiming(1, { duration: 250 });
    })
    .onChange((e) => {
      translationX.value += e.changeX;
      translationY.value += e.changeY;
    })
    .minDistance(0)
    .runOnJS(true);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.circle, style]} />
    </GestureDetector>
  );
}

export default function Example() {
  const [pointerType, setPointerType] = useState('Touch');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}> {pointerType} </Text>
      </View>
      <View style={styles.circleContainer}>
        <Circle pointerTypeUpdater={setPointerType} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },

  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',

    width: '100%',

    borderWidth: 2,
    borderStyle: 'dashed',
  },

  text: {
    fontSize: 32,
    textShadowColor: '#ffcccb',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },

  circleContainer: {
    justifyContent: 'space-around',
    flex: 15,
  },

  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
});
