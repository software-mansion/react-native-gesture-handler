import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useLongPressGesture,
} from 'react-native-gesture-handler';

export default function LongPressExample() {
  const longPressGesture = useLongPressGesture({
    onDeactivate: (e, success) => {
      if (success) {
        console.log(`Long pressed for ${e.duration} ms!`);
      }
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={longPressGesture}>
        <View style={styles.box} />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  box: {
    height: 120,
    width: 120,
    backgroundColor: '#b58df1',
    borderRadius: 20,
    marginBottom: 30,
  },
});
