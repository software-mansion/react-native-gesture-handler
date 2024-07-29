import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function LongPressExample() {
  const g = Gesture.LongPress()
    .onBegin(() => console.log('onBegin'))
    .onStart(() => console.log('onStart'))
    .onFinalize((_, success) => console.log('onFinalize', success))
    .onTouchesDown(() => console.log('onTouchesDown'))
    .onTouchesMove(() => console.log('onTouchesMove'))
    .onTouchesUp(() => console.log('onTouchesUp'))
    .minDuration(1000);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={g}>
        <View style={styles.pressBox} />
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
    backgroundColor: 'plum',
  },
});
