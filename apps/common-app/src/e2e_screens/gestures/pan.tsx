import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { WRONG_BOX_COLOR } from '../components/gestureColors';
import NormalBox from '../components/NormalBox';
import { gestureStyles as styles } from '../gestureStyles';

export default function PanScreen() {
  const navigation = useNavigation<any>();
  const [testID, setTestID] = useState('pan-idle');
  const activatePan = () => setTestID('pan-activated');

  const [startingCoordinates, setStartingCoordinates] = useState({
    x: 0,
    y: 0,
  });

  const updateCoordinates = (x: number, y: number) => {
    setStartingCoordinates({ x, y });
  };

  const panGesture = usePanGesture({
    onActivate: () => {
      'worklet';
      scheduleOnRN(activatePan);
      scheduleOnRN(updateCoordinates, 0, 0);
    },
    onUpdate: (e) => {
      'worklet';
      scheduleOnRN(updateCoordinates, e.translationX, e.translationY);
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View testID="container" style={localStyles.panSurface}>
          <Text style={styles.title}>Pan Gesture</Text>
          <Text style={styles.stateIndicator}>
            {testID === 'pan-activated' ? 'Pan Activated' : 'Idle'}
          </Text>
          <View>
            <Text style={styles.stateIndicator} testID="x-distance">
              x: {startingCoordinates.x.toFixed(2)}
            </Text>
            <Text style={styles.stateIndicator}>
              y: {startingCoordinates.y.toFixed(2)}
            </Text>
          </View>
          <View style={styles.content}>
            <NormalBox testID="wrong-element" color={WRONG_BOX_COLOR} />
            <View style={localStyles.gestureBox} testID={testID} />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Reset"
              onPress={() => {
                setTestID('pan-idle');
                setStartingCoordinates({ x: 0, y: 0 });
              }}
              testID="reset"
            />
            <Button
              title="Back to main"
              onPress={() => navigation.navigate('Gesture Tests')}
              testID="back-to-main"
            />
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const localStyles = StyleSheet.create({
  panSurface: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  gestureBox: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#4ecdc4',
  },
});
