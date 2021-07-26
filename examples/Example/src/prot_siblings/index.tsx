import React, { Component } from 'react';
import { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  event,
} from 'react-native-reanimated';

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

function Box(props) {
  const [s, setS] = useState(0);
  const gs = useGesture(
    new Tap({
      onUpdate: (e) => {
        console.log(
          props.color + ' ' + getState(e.nativeEvent.state) + ' ' + s
        );

        if (e.nativeEvent.state == 4) setS(s + 1);
      },
    })
  );

  return (
    <GestureMonitor gesture={gs}>
      <View
        style={[
          styles.box,
          { backgroundColor: props.color },
          props.overlap ? styles.overlap : {},
          props.style,
        ]}></View>
    </GestureMonitor>
  );

  /*const offset = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value * 255 }],
    };
  });
  const eventHandler = useAnimatedGestureHandler({
    onEnd: (event, ctx) => {
      offset.value = Math.random();
    },
  });

    return <Gesture gestures={[new Tap({ onUpdate: (e) => {
      console.log(props.color+" "+getState(e.nativeEvent.state)+" "+s);

      if (e.nativeEvent.state == 4)
          offset.value = Math.random();
      } }), new Pan({
        onUpdate: (e) => {
          console.log("Pan "+e.nativeEvent.state);
        }
      })]}>
        <Animated.View style={[ styles.box, { backgroundColor: props.color }, (props.overlap ? styles.overlap : {}), animatedStyles, props.style]}>
            
        </Animated.View>
    </Gesture>*/
}

export default function Example() {
  return (
    <View style={styles.home}>
      <Box color="red" style={{ zIndex: 3 }} />
      <Box color="green" overlap={true} />
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
  box: {
    width: 150,
    height: 150,
  },
  overlap: {
    position: 'absolute',
    left: 75,
    top: 75,
  },
});

export class Gesture extends React.Component {
  render() {
    let res = this.props.children;
    for (const gesture of this.props.gestures) {
      res = React.createElement(
        this.getHandler(gesture.handlerName),
        {
          onGestureEvent: gesture.config.onUpdate,
          onHandlerStateChange: gesture.config.onUpdate,
        },
        res
      );
    }
    return res;
  }

  getHandler(name) {
    switch (name) {
      case 'TapGestureHandler':
        return TapGestureHandler;
      case 'PanGestureHandler':
        return PanGestureHandler;
      case 'PinchGestureHandler':
        return PinchGestureHandler;
      case 'RotationGestureHandler':
        return RotationGestureHandler;
      case 'LongPressGestureHandler':
        return LongPressGestureHandler;
      case 'FlingGestureHandler':
        return FlingGestureHandler;
    }

    return View;
  }
}
