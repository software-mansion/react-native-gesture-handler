import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  useLongPressGesture,
  GestureHandlerRootView,
  useCompetingGestures,
} from 'react-native-gesture-handler';

export default function App() {
  const panGesture = usePanGesture({
    onUpdate: () => {
      console.log('Pan');
    },
  });
  const longPressGesture = useLongPressGesture({
    onDeactivate: (_, success) => {
      if (success) {
        console.log('Long Press');
      }
    },
  });

  const gesture = useCompetingGestures(panGesture, longPressGesture);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
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
