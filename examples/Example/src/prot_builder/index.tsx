import React, { Component, forwardRef } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { USE_NATIVE_DRIVER } from '../config';
import {
  TapGestureHandler,
  PanGestureHandler,
  LongPressGestureHandler,
  RotationGestureHandler,
  PinchGestureHandler,
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
  ComplexGesture,
  Gesture,
} from 'react-native-gesture-handler';
import { useState } from 'react';
import { createRef } from 'react';
import { useEffect } from 'react';

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

export default function Example() {
  const [counter, setCounter] = useState(0);

  // useEffect(() => {
  //   setInterval(() => {
  //     setCounter((c) => c + 1);
  //   }, 1000);
  // }, []);

  const tripleTap: React.Ref<any> = useRef();

  let doubleTapGesture = Gesture.tap()
    .setTapCount(2)
    .addRequiredToFailGesture(tripleTap)
    .setOnEnd((event, sc) => {
      if (sc) console.log('double tap');
    });

  let singleTapGesture = Gesture.tap()
    .addRequiredToFailGesture(tripleTap)
    .addRequiredToFailGesture(doubleTapGesture)
    .setOnEnd((event, sc) => {
      if (sc) {
        console.log('single tap, counter: ' + (counter + 1));
        setCounter(counter + 1);
      }
    });

  let longPressGesture = Gesture.longPress()
    .setMinDuration(700)
    .setOnStart((event) => {
      console.log('long press start');
    })
    .setOnEnd((event, sc) => {
      if (sc) console.log('long pressed for: ' + event.duration + ' ms');
    });

  let panGesture = Gesture.pan()
    .addRequiredActiveGesture(longPressGesture)
    .setOnUpdate((event) => {
      console.log(
        'pan, x: ' + event.translationX + ', y: ' + event.translationY
      );
    });

  let gesture = useGesture(
    singleTapGesture
      .exclusiveWith(doubleTapGesture)
      .exclusiveWith(longPressGesture)
      .exclusiveWith(panGesture)
  );

  return (
    <TapGestureHandler
      ref={tripleTap}
      onHandlerStateChange={(e) => {
        if (e.nativeEvent.state == 4) console.log('triple');
      }}
      numberOfTaps={3}>
      <View style={styles.home}>
        <GestureMonitor gesture={gesture}>
          <Test counter={counter} />
        </GestureMonitor>
      </View>
    </TapGestureHandler>
  );
}

const Test = (props) => {
  return (
    <View style={[styles.button]}>
      <Text>{props.counter}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  home: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: 'plum',
  },
  button: {
    width: 200,
    height: 200,
    backgroundColor: 'green',
    alignSelf: 'center',
  },
});
