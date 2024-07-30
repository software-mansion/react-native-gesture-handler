import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function ManualExample() {
  const g = Gesture.Manual()
    .onBegin(() => console.log('onBegin'))
    .onStart(() => console.log('onStart'))
    .onFinalize((_, success) => console.log('onFinalize', success))
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
