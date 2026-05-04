import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import {
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import GestureBox from '../components/GestureBox';
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
      <Text style={styles.title}>Pan Gesture</Text>
      <Text style={styles.stateIndicator}>
        {testID === 'pan-activated' ? 'Pan Activated' : 'Idle'}
      </Text>
      <Text style={styles.stateIndicator}>
        {`Coordinates: (${startingCoordinates.x.toFixed(2)}, ${startingCoordinates.y.toFixed(2)})`}
      </Text>
      <View style={styles.content}>
        <NormalBox testID="wrong-element" color={WRONG_BOX_COLOR} />
        <GestureBox gesture={panGesture} testID={testID} />
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
    </GestureHandlerRootView>
  );
}
