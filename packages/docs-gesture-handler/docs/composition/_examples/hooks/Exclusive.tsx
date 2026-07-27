import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useExclusiveGestures,
  useTapGesture,
} from 'react-native-gesture-handler';

export default function App() {
  const singleTap = useTapGesture({
    onDeactivate: (e) => {
      if (!e.canceled) {
        console.log('Single tap!');
      }
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: (e) => {
      if (!e.canceled) {
        console.log('Double tap!');
      }
    },
  });

  const taps = useExclusiveGestures(doubleTap, singleTap);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={taps}>
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
    width: 100,
    height: 100,
    backgroundColor: 'plum',
  },
});
