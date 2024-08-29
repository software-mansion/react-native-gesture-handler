import React from 'react';
import { Button, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const [enabled, setEnabled] = React.useState(true);
  const data = [0];

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .activateAfterLongPress(1000)
    .onBegin(() => {
      console.log('pan touched');
    })
    .onStart(() => {
      console.warn('pan triggered');
    })
    .onTouchesDown(() => console.log('touch down'))
    .onTouchesUp(() => console.log('touch up'));

  return (
    <GestureDetector gesture={panGesture}>
      <FlashList
        data={data}
        ListHeaderComponent={
          <Button
            title={enabled ? 'Disable Gestures' : 'Enable Gestures'}
            onPress={() => {
              setEnabled((prev) => !prev);
            }}
          />
        }
        renderItem={() => {
          return (
            <View
              style={{
                height: 70,
                backgroundColor: 'tomato',
              }}
            />
          );
        }}
      />
    </GestureDetector>
  );
}
