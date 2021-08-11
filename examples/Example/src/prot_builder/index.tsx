import React from 'react';
import { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  TapGestureHandler,
  GestureMonitor,
  useGesture,
  Gesture,
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

export default function Example() {
  const [counter, setCounter] = useState(0);

  // useEffect(() => {
  //   setInterval(() => {
  //     setCounter((c) => c + 1);
  //   }, 1000);
  // }, []);

  const doubleTap: React.RefObject<any> = useRef();
  const tripleTap: React.RefObject<any> = useRef();

  let tripleTapGesture = Gesture.tap()
    .setRef(tripleTap)
    .setTapCount(3)
    .addRequiredToFailGesture(doubleTap)
    .setOnEnd((event, sc) => {
      if (sc) console.log('triple tap');
    });

  let singleTapGesture = Gesture.tap()
    .addRequiredToFailGesture(doubleTap)
    .addRequiredToFailGesture(tripleTapGesture)
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
      .exclusiveWith(tripleTapGesture)
      .exclusiveWith(longPressGesture)
      .exclusiveWith(panGesture)
  );

  return (
    <TapGestureHandler
      ref={doubleTap}
      waitFor={tripleTap}
      onHandlerStateChange={(e) => {
        if (e.nativeEvent.state == 4) console.log('double');
      }}
      numberOfTaps={2}>
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
