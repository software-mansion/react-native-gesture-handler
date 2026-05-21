import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  ScrollView,
  usePanGesture,
} from 'react-native-gesture-handler';

export default function PanScreen() {
  const [text, setText] = useState('');

  const panGesture = usePanGesture({
    onBegin: () => {
      setText((prev) => prev + '1');
    },
    onActivate: () => {
      setText((prev) => prev + '2');
    },
    onUpdate: () => {
      // Skip subsequent updates
      if (text[text.length - 1] === '3') {
        return;
      }
      setText((prev) => prev + '3');
    },
    onDeactivate: () => {
      setText((prev) => prev + '4');
    },
    onFinalize: () => {
      setText((prev) => prev + '5');
    },
    runOnJS: true,
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text testID="state-indicator" style={styles.stateIndicator}>
          {text}
        </Text>
      </ScrollView>
      <View testID="container" style={styles.innerContainer}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.gestureBox} testID="pan-box" />
        </GestureDetector>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          testID="reset"
          style={styles.resetButton}
          onPress={() => {
            setText('');
          }}>
          <Text>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    height: 50,
    maxHeight: 50,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stateIndicator: {
    fontSize: 15,
    alignSelf: 'flex-start',
  },
  gestureBox: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#4ecdc4',
  },
  buttonContainer: {
    height: 60,
    maxHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
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
