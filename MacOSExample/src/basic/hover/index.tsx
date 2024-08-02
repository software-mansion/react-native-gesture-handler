import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimationDuration = 250;

const Colors = {
  Initial: '#0a2688',
  Hovered: '#6fcef5',
};

export default function HoverExample() {
  const isHovered = useSharedValue(false);
  const colorProgress = useSharedValue(0);
  const color1 = useSharedValue(Colors.Initial);
  const color2 = useSharedValue(Colors.Hovered);

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      [color1.value, color2.value]
    );

    return {
      transform: [
        {
          scale: withTiming(isHovered.value ? 1.2 : 1, {
            duration: AnimationDuration,
          }),
        },
      ],
      backgroundColor,
    };
  });

  const g = Gesture.Hover()
    .onBegin(() => {
      console.log('onBegin');

      isHovered.value = true;
      colorProgress.value = withTiming(1, {
        duration: AnimationDuration,
      });
    })
    .onStart(() => console.log('onStart'))
    .onEnd(() => console.log('onEnd'))
    .onFinalize((_, success) => {
      console.log('onFinalize', success);

      isHovered.value = false;

      colorProgress.value = withTiming(0, {
        duration: AnimationDuration,
      });
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={g}>
        <Animated.View style={[styles.pressBox, animatedStyles]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  pressBox: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
});
