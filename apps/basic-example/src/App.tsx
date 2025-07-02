/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Button, View } from 'react-native';
import {
  GestureHandlerRootView,
  NativeDetector,
  useGesture,
} from 'react-native-gesture-handler';

export default function App() {
  const [visible, setVisible] = React.useState(true);
  const tap = useGesture('TapGestureHandler', {
    numberOfTaps: 2,
  });

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: 'white', paddingTop: 150 }}>
      <Button
        title="Toggle"
        onPress={() => {
          setVisible(!visible);
        }}
      />

      {visible && (
        <NativeDetector gesture={tap}>
          <View
            style={{
              width: 150,
              height: 150,
              backgroundColor: 'blue',
              opacity: 0.5,
              borderWidth: 10,
              borderColor: 'green',
              marginTop: 20,
              marginLeft: 40,
            }}
          />
        </NativeDetector>
      )}
    </GestureHandlerRootView>
  );
}
