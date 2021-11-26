import { StyleSheet, View } from 'react-native';

import Animated from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import React from 'react';

export default function FabricPanGestureHandlerExample() {
  const onGestureEvent = () => {
    console.log('onGestureEvent');
  };

  const onHandlerStateChange = () => {
    console.log('onHandlerStateChange');
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View style={styles.box} />
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 200,
    height: 200,
    backgroundColor: 'lime',
  },
});
