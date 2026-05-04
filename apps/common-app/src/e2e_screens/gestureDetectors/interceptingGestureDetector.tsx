import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import {
  GestureHandlerRootView,
  InterceptingGestureDetector,
  useTapGesture,
} from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { gestureStyles as styles } from '../gestureStyles';

export default function InterceptingGestureDetectorScreen() {
  const navigation = useNavigation<any>();
  const [state, setState] = useState('tap-idle');

  const activateGesture = () => setState('tap-activated');

  const tapGesture = useTapGesture({
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateGesture);
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Intercepting Gesture Detector</Text>
      <Text style={styles.stateIndicator}>
        {state === 'tap-activated' ? 'Tap Activated' : 'Idle'}
      </Text>
      <View style={styles.content}>
        <InterceptingGestureDetector gesture={tapGesture}>
          <View>
            <Text style={{ fontSize: 18, textAlign: 'center' }} testID={state}>
              Tap inside this area
            </Text>
          </View>
        </InterceptingGestureDetector>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Reset"
          onPress={() => setState('tap-idle')}
          testID="reset"
        />
        <Button
          title="Back to main"
          onPress={() => navigation.navigate('Gesture Detectors')}
          testID="back-to-main"
        />
      </View>
    </GestureHandlerRootView>
  );
}
