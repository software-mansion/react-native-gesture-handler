import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

export default function PanScreen() {
  const [text, setText] = useState('');
  const [states, setStates] = useState<number[]>([]);

  const panGesture = usePanGesture({
    onBegin: () => {
      setStates((prev) => [...prev, 2]);
    },
    onActivate: () => {
      setStates((prev) => [...prev, 4]);
    },
    onUpdate: () => {
      setStates((prev) => [...prev, 4]);
    },
    onDeactivate: () => {
      setStates((prev) => [...prev, 5]);
    },
    onFinalize: (e) => {
      setStates((prev) => [...prev, e.canceled ? 1 : 5]);
    },
    runOnJS: true,
  });

  return (
    <View style={styles.container}>
      <Text testID="state-indicator" style={styles.stateIndicator}>
        {text}
      </Text>
      <View testID="container" style={styles.innerContainer}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.gestureBox} testID="pan-box" />
        </GestureDetector>

        <Pressable
          testID="reset"
          style={styles.resetButton}
          onPress={() => {
            setText('');
            setStates([]);
          }}>
          <Text>Reset</Text>
        </Pressable>

        <Pressable
          testID="event-extractor"
          style={styles.resetButton}
          onPress={() => {
            setText([...new Set(states)].join(''));
          }}>
          <Text>Extract</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f7fff7',
  },
  stateIndicator: {
    fontSize: 20,
    alignSelf: 'flex-start',
  },
  gestureBox: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#4ecdc4',
  },
  resetButton: {
    width: 120,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'royalblue',

    justifyContent: 'center',
    alignItems: 'center',
  },
});
