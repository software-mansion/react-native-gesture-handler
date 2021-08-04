import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  GestureMonitor,
  ComplexGesture,
  Pan,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAnimatedGesture } from '../useAnimatedGesture';

function Draggable() {
  const [a, sa] = useState(1);

  useEffect(() => {
    setInterval(() => {
      sa((a) => a + 1);
    }, 1000);
  }, []);

  const pressed = useSharedValue(false);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
        { scale: withSpring(pressed.value ? 1.2 : 1) },
      ],
      backgroundColor: pressed.value ? 'yellow' : 'blue',
    };
  });

  const gs = useAnimatedGesture(
    new Pan({
      onBegan: (e) => {
        pressed.value = true;
      },
      onEnd: (e, success) => {
        startX.value = offsetX.value;
        startY.value = offsetY.value;
        pressed.value = false;
      },
      onUpdate: (e) => {
        offsetX.value = e.translationX + startX.value;
        offsetY.value = e.translationY + startY.value;
        //console.log(a);
      },
    })
  );

  return (
    <View>
      <Text>{a}</Text>
      <GestureMonitor gesture={gs}>
        <Test s={animatedStyles} />
      </GestureMonitor>
    </View>
  );
}

const Test = wrapAnimated((props) => {
  return (
    <View>
      <Animated.View style={[styles.button, props.s]} />
    </View>
  );
});

function wrapAnimated(Fc) {
  return React.forwardRef((props, ref) => {
    return (
      <Animated.View
        ref={ref}
        onGestureHandlerEvent={props.onGestureHandlerEvent}
        onGestureHandlerStateChange={props.onGestureHandlerStateChange}>
        <Fc {...props} />
      </Animated.View>
    );
  });
}

export default function Example() {
  return (
    <View style={styles.home}>
      <Draggable />
    </View>
  );
}

const styles = StyleSheet.create({
  home: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: 'red',
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
});
