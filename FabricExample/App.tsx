import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  PanGestureHandler,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {LogBox, StyleSheet, Text, View} from 'react-native';

import React from 'react';

declare const _WORKLET: boolean; // from react-native-reanimated

LogBox.ignoreLogs([
  "Seems like you're using an old API with gesture components",
]);

export default function App() {
  const gesture = Gesture.Pan();
  // this syntax ensures that callbacks are not auto-workletized
  gesture
    .onBegin(() => {
      console.log(global._WORKLET, 'onBegin');
    })
    .onStart(() => {
      console.log(global._WORKLET, 'onStart');
    })
    .onUpdate(() => {
      console.log(global._WORKLET, 'onUpdate');
    })
    .onEnd(() => {
      console.log(global._WORKLET, 'onEnd');
    })
    .onFinalize(() => {
      console.log(global._WORKLET, 'onFinalize');
    });

  const onGestureEvent = () => {
    console.log(global._WORKLET, 'onGestureEvent');
  };

  const onHandlerStateChange = () => {
    console.log(global._WORKLET, 'onHandlerStateChange');
  };

  const onPressIn = () => {
    console.log(global._WORKLET, 'onPressIn');
  };

  const onPressOut = () => {
    console.log(global._WORKLET, 'onPressOut');
  };

  const onPress = () => {
    console.log(global._WORKLET, 'onPress');
  };

  const onLongPress = () => {
    console.log(global._WORKLET, 'onLongPress');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text>GestureDetector</Text>
      <GestureDetector gesture={gesture}>
        <View style={styles.box1} />
      </GestureDetector>
      <Text>PanGestureHandler</Text>
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <View style={styles.box2} />
      </PanGestureHandler>
      {/* <Button onPress={() => setCount(c => c + 1)} title={count.toString()} /> */}
      <Text>TouchableOpacity</Text>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={styles.box3} />
      </TouchableOpacity>
      <Text>TouchableNativeFeedback</Text>
      <TouchableNativeFeedback
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={styles.box4} />
      </TouchableNativeFeedback>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box1: {
    width: 50,
    height: 50,
    backgroundColor: 'cyan',
    marginBottom: 10,
  },
  box2: {
    width: 50,
    height: 50,
    backgroundColor: 'magenta',
    marginBottom: 10,
  },
  box3: {
    width: 50,
    height: 50,
    backgroundColor: 'gold',
  },
  box4: {
    width: 50,
    height: 50,
    backgroundColor: 'gray',
  },
});
