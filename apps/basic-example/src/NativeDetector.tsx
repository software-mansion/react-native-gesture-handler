import * as React from 'react';
import { Animated, Button, useAnimatedValue } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  usePanGesture,
} from 'react-native-gesture-handler';

export default function App() {
  const [visible, setVisible] = React.useState(true);

  const value = useAnimatedValue(0);
  const event = Animated.event(
    [{ nativeEvent: { handlerData: { translationX: value } } }],
    {
      useNativeDriver: true,
    }
  );

  const gesture = usePanGesture({
    onUpdate: event,
  });

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: 'white', paddingTop: 8 }}>
      <Button
        title="Toggle visibility"
        onPress={() => {
          setVisible(!visible);
        }}
      />

      {visible && (
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              {
                width: 150,
                height: 150,
                backgroundColor: 'blue',
                opacity: 0.5,
                borderWidth: 10,
                borderColor: 'green',
                marginTop: 20,
                marginLeft: 40,
              },
              { transform: [{ translateX: value }] },
            ]}
          />
        </GestureDetector>
      )}
    </GestureHandlerRootView>
  );
}
