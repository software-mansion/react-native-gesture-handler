import {
  GestureHandlerRootView,
  useRotationGesture,
} from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { gestureStyles as styles } from '../gestureStyles';
import { scheduleOnRN } from 'react-native-worklets';
import GestureBox from '../components/GestureBox';
import { WRONG_BOX_COLOR } from '../components/gestureColors';

export default function RotationScreen() {
  const navigation = useNavigation<any>();
  const [testID, setTestID] = useState('rotation-idle');
  const activateRotation = () => setTestID('rotation-activated');
  const rotationGesture = useRotationGesture({
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateRotation);
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Rotation Gesture</Text>
      <View style={styles.content}>
        <GestureBox testID="wrong-element" color={WRONG_BOX_COLOR} />
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
          onPress={() => navigation.navigate('Main')}
          testID="back-to-main"
        />
      </View>
    </GestureHandlerRootView>
  );
}
