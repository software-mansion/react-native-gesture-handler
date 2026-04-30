import { View } from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import { useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { scheduleOnRN } from 'react-native-worklets';

export default function RequireToFail() {
  const [innerTestID, setInnerTestID] = useState('inner-idle');
  const [outerTestID, setOuterTestID] = useState('outer-idle');
  const reset = () => {
    setInnerTestID('inner-idle');
    setOuterTestID('outer-idle');
  };
  const activateInner = () => setInnerTestID('inner-activated');
  const activateOuter = () => setOuterTestID('outer-activated');

  const innerTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateInner);
      console.log('Inner activated');
    },
  });
  const outerTap = useTapGesture({
    requireToFail: innerTap,
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateOuter);
      console.log('Outer activated');
    },
  });
  return (
    <View style={styles.container}>
      <GestureDetector gesture={outerTap}>
        <View style={styles.outerBox} testID={outerTestID}>
          <GestureDetector gesture={innerTap}>
            <View style={styles.innerBox} testID={innerTestID} />
          </GestureDetector>
        </View>
      </GestureDetector>
      <View style={styles.buttonContainer}>
        <Button title="Reset" onPress={reset} testID="reset" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  innerBox: {
    width: 100,
    height: 100,
    backgroundColor: 'cyan',
    borderRadius: 20,
  },
  outerBox: {
    width: 200,
    height: 200,
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
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
