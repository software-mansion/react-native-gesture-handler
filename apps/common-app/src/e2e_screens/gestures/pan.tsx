import {
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { gestureStyles as styles } from '../gestureStyles';
import { scheduleOnRN } from 'react-native-worklets';
import GestureBox from '../components/GestureBox';
import { WRONG_BOX_COLOR } from '../components/gestureColors';

export default function PanScreen() {
  const navigation = useNavigation<any>();
  const [testID, setTestID] = useState('pan-idle');
  const activatePan = () => setTestID('pan-activated');
  const panGesture = usePanGesture({
    onActivate: () => {
      'worklet';
      scheduleOnRN(activatePan);
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Pan Gesture</Text>
      <View style={styles.content}>
        <GestureBox testID="wrong-element" color={WRONG_BOX_COLOR} />
        <GestureBox gesture={panGesture} testID={testID} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Reset"
          onPress={() => setTestID('pan-idle')}
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
