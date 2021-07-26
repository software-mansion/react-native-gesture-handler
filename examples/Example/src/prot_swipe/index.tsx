import React, { Component } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, Animated, Text } from 'react-native';
import { USE_NATIVE_DRIVER } from '../config';
import {
  TapGestureHandler,
  PanGestureHandler,
  GestureMonitor,
  useGesture,
  Pan,
  Tap,
  Simultaneous,
  Pinch,
  Rotation,
  Exclusive,
  Sequence,
  LongPress,
} from 'react-native-gesture-handler';
import { useState } from 'react';

function getState(s: number) {
  switch (s) {
    case 0:
      return 'Undetermined';
    case 1:
      return 'Failed';
    case 2:
      return 'Began';
    case 3:
      return 'Cancelled';
    case 4:
      return 'Active';
    case 5:
      return 'End';
  }
  return s;
}

function Draggable() {
  let x = 0;

  const [opened, setOpened] = useState(false);

  const gs = useGesture(
    new Pan({
      onUpdate: (e) => {
        if (e.nativeEvent.state == 2) {
          x = translationX._value;
        }

        if (x + e.nativeEvent.translationX < 0) {
          if (x + e.nativeEvent.translationX > -150) {
            translationX.setValue(x + e.nativeEvent.translationX);
          } else {
            translationX.setValue(-150);
          }
        } else {
          translationX.setValue(0);
        }
        const cutoff = 40;
        if (e.nativeEvent.state == 5) {
          if (opened) {
            if (e.nativeEvent.translationX > cutoff) {
              setOpened(false);
              Animated.timing(translationX, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }).start();
              translationX._value = 0;
            } else {
              Animated.timing(translationX, {
                toValue: -150,
                duration: 150,
                useNativeDriver: true,
              }).start();
              translationX._value = -150;
            }
          } else if (!opened) {
            if (e.nativeEvent.translationX < cutoff) {
              setOpened(true);
              Animated.timing(translationX, {
                toValue: -150,
                duration: 150,
                useNativeDriver: true,
              }).start();
              translationX._value = -150;
            } else {
              Animated.timing(translationX, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }).start();
              translationX._value = 0;
            }
          }
        }
      },
    })
  );

  const translationX = useRef(new Animated.Value(0)).current;

  return (
    <GestureMonitor
      gesture={gs}
      onHandlerStateChange={(e) => console.log(e.nativeEvent.state)}>
      <View style={[styles.bg]}>
        <Animated.View style={[styles.box, styles.buttons]}>
          <View style={[styles.button, { backgroundColor: 'yellow' }]} />
          <View style={[styles.button, { backgroundColor: 'purple' }]} />
        </Animated.View>
        <Animated.View
          style={[
            styles.swipable,
            styles.box,
            { transform: [{ translateX: translationX }] },
          ]}>
          <Text>Napis</Text>
        </Animated.View>
      </View>
    </GestureMonitor>
  );
}

export default function Example() {
  return (
    <View style={styles.home}>
      <Draggable />
      <Draggable />
    </View>
  );
}

const styles = StyleSheet.create({
  home: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: 'plum',
  },
  swipable: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    alignSelf: 'center',
  },
  box: {
    width: '100%',
    height: 75,
  },
  buttons: {
    backgroundColor: 'red',
    position: 'absolute',
    alignItems: 'flex-end',
    flexDirection: 'row-reverse',
  },
  button: {
    width: 75,
    height: 75,
  },
  bg: {
    //backgroundColor: 'rgba(0,0,0,0)'
  },
});
