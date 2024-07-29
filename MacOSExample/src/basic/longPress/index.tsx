import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function LongPressExample() {
  const g = Gesture.LongPress()
    .onBegin((e) => console.log('onBegin'))
    .onStart((e) => console.log('onStart'))
    .onFinalize((e, s) => console.log('onFinalize', s))
    .onTouchesDown((e) => console.log('onTouchesDown'))
    .onTouchesMove((e) => console.log('onTouchesMove'))
    .onTouchesUp((e) => console.log('onTouchesUp'))
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
