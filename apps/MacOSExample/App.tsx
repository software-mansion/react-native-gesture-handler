import { StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const uiManager = global?.nativeFabricUIManager ? 'Fabric' : 'Paper';
console.log(`Using ${uiManager}`);

export default function App() {
  const g = Gesture.Tap().onEnd(console.log);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={g}>
        <View style={styles.ball} />
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
  ball: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'crimson',
  },
});
