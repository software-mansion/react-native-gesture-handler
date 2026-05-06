import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import {
  GestureHandlerRootView,
  useRotationGesture,
} from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import GestureBox from '../components/GestureBox';
import { gestureStyles as styles } from '../gestureStyles';

export default function RotationScreen() {
  const navigation = useNavigation<any>();
  const [testID, setTestID] = useState('rotation-idle');
  const activateRotation = () => setTestID('rotation-activated');
  const rotationGesture = useRotationGesture({
    onTouchesDown: () => {
      'worklet';
      console.log('Rotation gesture started');
    },
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateRotation);
      console.log('Rotation activated');
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Rotation Gesture</Text>
      <Text style={styles.stateIndicator}>
        {testID === 'rotation-activated' ? 'Rotation Activated' : 'Idle'}
      </Text>
      <View style={styles.content}>
        <GestureBox gesture={rotationGesture} testID={testID} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Reset"
          onPress={() => setTestID('rotation-idle')}
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
