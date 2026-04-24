import {
  GestureHandlerRootView,
  useLongPressGesture,
} from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { gestureStyles as styles } from '../gestureStyles';
import { scheduleOnRN } from 'react-native-worklets';
import GestureBox from '../components/GestureBox';
import { WRONG_BOX_COLOR } from '../components/gestureColors';

export default function LongPressScreen() {
  const navigation = useNavigation<any>();
  const [testID, setTestID] = useState('long-press-idle');
  const activateLongPress = () => setTestID('long-press-activated');
  const longPressGesture = useLongPressGesture({
    minDuration: 500,
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateLongPress);
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Long Press Gesture</Text>
      <View style={styles.content}>
        <GestureBox testID="wrong-element" color={WRONG_BOX_COLOR} />
        <GestureBox gesture={longPressGesture} testID={testID} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Reset"
          onPress={() => setTestID('long-press-idle')}
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
