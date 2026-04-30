import { View } from 'react-native';
import {
  useTapGesture,
  useExclusiveGestures,
} from 'react-native-gesture-handler';
import { useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { scheduleOnRN } from 'react-native-worklets';
import GestureBox from '../components/GestureBox';
import { Text } from 'react-native';

export default function ExclusiveGestures() {
  const [testID, setTestID] = useState('exclusive-idle');
  const reset = () => {
    setTestID('exclusive-idle');
  };
  const activateDoubleTap = () => setTestID('exclusive-double-tap-activated');
  const activateSingleTap = () => setTestID('exclusive-single-tap-activated');

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateDoubleTap);
      console.log('Double tap activated');
    },
  });
  const singleTap = useTapGesture({
    numberOfTaps: 1,
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateSingleTap);
      console.log('Single tap activated');
    },
  });

  const gesture = useExclusiveGestures(doubleTap, singleTap);

  return (
    <View style={styles.container}>
      <Text style={styles.stateIndicator}>
        {testID === 'exclusive-double-tap-activated'
          ? 'Double Tap Activated'
          : testID === 'exclusive-single-tap-activated'
            ? 'Single Tap Activated'
            : 'Idle'}
      </Text>
      <GestureBox gesture={gesture} testID={testID} />
      <View style={styles.buttonContainer}>
        <Button title="Reset" onPress={reset} testID="reset" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stateIndicator: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
    color: '#333',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 24,
  },
});
