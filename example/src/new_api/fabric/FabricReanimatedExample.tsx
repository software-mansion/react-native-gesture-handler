import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type FigureProps = {
  borderRadius: number;
  color: string;
};

function Figure({ borderRadius, color }: FigureProps) {
  const isPressed = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(isPressed.value ? 1.2 : 1) },
      ],
      backgroundColor: isPressed.value ? 'gold' : color,
    };
  });

  const gesture = Gesture.Pan()
    .onBegin(() => {
      // 'worklet';
      console.log(_WORKLET, 'onBegin');
      isPressed.value = true;
    })
    .onUpdate((e) => {
      // 'worklet';
      console.log(_WORKLET, 'onUpdate');
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      // 'worklet';
      console.log(_WORKLET, 'onEnd');
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
      isPressed.value = false;
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[{ ...styles.figure, borderRadius }, animatedStyles]}
      />
    </GestureDetector>
  );
}

export default function FabricReanimatedExample() {
  return (
    <View style={styles.container}>
      <Figure borderRadius={0} color="red" />
      <Figure borderRadius={25} color="lime" />
      <Figure borderRadius={50} color="blue" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  figure: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    backgroundColor: 'black',
  },
});
