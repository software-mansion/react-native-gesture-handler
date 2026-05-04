import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import {
  GestureHandlerRootView,
  InterceptingGestureDetector,
  useTapGesture,
  VirtualGestureDetector,
} from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { gestureStyles as styles } from '../gestureStyles';

export default function VirtualGestureDetectorScreen() {
  const navigation = useNavigation<any>();
  const [state, setState] = useState('tap-idle');

  const activateGesture = () => setState('tap-activated');

  const tapGesture = useTapGesture({
    onActivate: () => {
      'worklet';
      scheduleOnRN(activateGesture);
      console.log('Virtual Gesture Activated');
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Virtual Gesture Detector</Text>
      <Text style={styles.stateIndicator}>
        {state === 'tap-activated' ? 'Activated' : 'Idle'}
      </Text>
      <View style={[styles.content]}>
        <InterceptingGestureDetector>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text testID="text">Click on the word&nbsp;</Text>
            <VirtualGestureDetector gesture={tapGesture}>
              <Text testID={state} style={{ fontWeight: '700' }}>
                activate
              </Text>
            </VirtualGestureDetector>
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
