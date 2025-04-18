import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const Durations = {
  LongPress: 750,
  Reset: 350,
  Scale: 120,
};

const Colors = {
  Initial: '#0a2688',
  Loading: '#6fcef5',
  Success: '#32a852',
  Fail: '#b02525',
};

export default function LongPressExample() {
  const isPressed = useSharedValue(false);
  const colorProgress = useSharedValue(0);
  const color1 = useSharedValue(Colors.Initial);
  const color2 = useSharedValue(Colors.Loading);

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      [color1.value, color2.value]
    );

    return {
      transform: [
        {
          scale: withTiming(isPressed.value ? 1.2 : 1, {
            duration: Durations.Scale,
          }),
        },
      ],
      backgroundColor,
    };
  });

  const g = Gesture.LongPress()
    .onBegin(() => {
      console.log('onBegin');

      isPressed.value = true;
      colorProgress.value = withTiming(1, {
        duration: Durations.LongPress,
      });
    })
    .onStart(() => console.log('onStart'))
    .onEnd(() => console.log('onEnd'))
    .onFinalize((_, success) => {
      console.log('onFinalize', success);

      isPressed.value = false;

      color1.value = Colors.Initial;
      color2.value = success ? Colors.Success : Colors.Fail;

      colorProgress.value = withTiming(
        0,
        {
          duration: Durations.Reset,
        },
        () => {
          color2.value = Colors.Loading;
        }
      );
    })
    .onTouchesDown(() => console.log('onTouchesDown'))
    .onTouchesMove(() => console.log('onTouchesMove'))
    .onTouchesUp(() => console.log('onTouchesUp'))
    .minDuration(Durations.LongPress);

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
