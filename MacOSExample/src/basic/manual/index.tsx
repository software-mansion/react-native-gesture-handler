import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export default function ManualExample() {
  const isPressed = useSharedValue(false);
  const colorProgress = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['#0a2688', '#6fcef5']
    );

    return {
      transform: [
        { scale: withTiming(isPressed.value ? 1.2 : 1, { duration: 100 }) },
      ],
      backgroundColor,
    };
  });

  const g = Gesture.Manual()
    .onBegin(() => console.log('onBegin'))
    .onStart(() => {
      console.log('onStart');
      isPressed.value = true;
      colorProgress.value = withTiming(1, {
        duration: 100,
      });
    })
    .onFinalize(() => {
      console.log('onFinalize');
      isPressed.value = false;
      colorProgress.value = withTiming(0, {
        duration: 100,
      });
    })
    .onTouchesDown((e, stateManager) => {
      console.log('onTouchesDown', e);
      stateManager.activate();
    })
    .onTouchesMove((e) => console.log('onTouchesMove', e.state))
    .onTouchesUp((e, stateManager) => {
      stateManager.end();
      console.log('onTouchesUp', e);
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={g}>
        <Animated.View style={[animatedStyles, styles.pressBox]} />
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
