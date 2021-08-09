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

  const tripleTap = useRef();
  const doubleTap = useRef();
  const longPress = useRef();

  let gesture = useGesture(
    new ComplexGesture()
      .tap({
        ref: doubleTap,
        requireToFail: tripleTap,
        numberOfTaps: 2,
        onEnd: (event, sc) => {
          if (sc) console.log('double tap');
        },
      })
      .tap({
        requireToFail: [doubleTap, tripleTap],
        onEnd: (event, sc) => {
          if (sc) {
            console.log('single tap, counter: ' + (counter + 1));
            setCounter(counter + 1);
          }
        },
      })
      .longPress({
        ref: longPress,
        minDuration: 700,
        onStart: (event) => {
          console.log('long press start');
        },
        onEnd: (event, sc) => {
          if (sc)
            console.log(
              'long pressed for: ' + event.nativeEvent.duration + ' ms'
            );
        },
      })
      .pan({
        after: longPress,
        onUpdate: (event) => {
          console.log(
            'pan, x: ' +
              event.nativeEvent.translationX +
              ', y: ' +
              event.nativeEvent.translationY
          );
        },
        onCanceled: (e) => {
          console.log('pan canceled');
        },
      })
  );

  // let tripleTapGesture = useGesture(
  //   new Gesture().tap({
  //     ref: tripleTap,
  //     numberOfTaps: 3,
  //     onEnd: (e, sc) => {
  //       if (sc) console.log('triple tap');
  //     },
  //   })
  // );

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

  // return (
  //   <View>
  //     <GestureMonitor gesture={useGesture(new Gesture().pinch({onUpdate: e => { console.log('pinch') }, priority: 1 }))}>
  //       <View>
  //         <GestureMonitor gesture={useGesture(new Gesture().rotation({onUpdate: e => { console.log('rotate') }}))}>
  //           <View style={styles.button} />
  //         </GestureMonitor>
  //       </View>
  //     </GestureMonitor>

  //     {/* <GestureMonitor gesture={useGesture(new Gesture().tap({onEnd: (e, s) => {if(s)console.log("outer")}, priority: 1 }))}>
  //       <View>
  //         <GestureMonitor gesture={useGesture(new Gesture().tap({onEnd: (e, s) => {if(s)console.log("inner")}}))}>
  //           <View style={styles.button}/>
  //         </GestureMonitor>

  //         <GestureMonitor gesture={useGesture(new Gesture().fling({}))}>
  //           <View>
  //             <GestureMonitor gesture={useGesture(new Gesture().pinch({}).rotation({}))}>
  //               <View>
  //                 <Text>{counter}</Text>
  //               </View>
  //             </GestureMonitor>
  //           </View>
  //         </GestureMonitor>
  //       </View>
  //     </GestureMonitor> */}
  //   </View>
  // )
}

// function Test(props) {
//   return <View style={[styles.button]} {...props}>
//     <Text>{props.counter}</Text>
//   </View>
// }

const Test = wrap((props) => {
  return (
    <View style={[styles.button]}>
      <Text>{props.counter}</Text>
    </View>
  );
});

function wrap(Fc) {
  return React.forwardRef((props, ref) => {
    return (
      <View
        ref={ref}
        style={{ backgroundColor: 'transparent' }}
        onGestureHandlerEvent={props.onGestureHandlerEvent}
        onGestureHandlerStateChange={props.onGestureHandlerStateChange}>
        <Fc {...props} />
      </View>
    );
  });
}

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
