import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import {
  GestureHandlerRootView,
  useTapGesture,
} from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import GestureBox from '../components/GestureBox';
import { WRONG_BOX_COLOR } from '../components/gestureColors';
import NormalBox from '../components/NormalBox';
import { gestureStyles as styles } from '../gestureStyles';

export default function TapScreen() {
  const navigation = useNavigation<any>();
  const [testID, setTestID] = useState('tap-idle');
  const activateTap = () => setTestID('tap-activated');
  const tapGesture = useTapGesture({
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateTap);
    },
  });
  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title} testID="title">
        Tap Gesture
      </Text>
      <Text style={styles.stateIndicator}>
        {testID === 'tap-activated' ? 'Tap Activated' : 'Idle'}
      </Text>
      <View style={styles.content}>
        <NormalBox color={WRONG_BOX_COLOR} />
        <GestureBox gesture={tapGesture} testID={testID} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Reset"
          onPress={() => setTestID('tap-idle')}
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
