import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureMonitor,
  useGesture,
  Gesture,
} from 'react-native-gesture-handler';

function Box(props) {
  const gs = useGesture(
    Gesture.tap().setOnEnd((e, s) => {
      if (s) console.log(props.color);
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
        ]}>
        {props.children}
      </View>
    </GestureMonitor>
  );
}

export default function Example() {
  const gs = useGesture(
    Gesture.pan().setOnUpdate((e) => {
      console.log('pan');
    })
  );

  return (
    <View style={styles.home}>
      <GestureMonitor gesture={gs}>
        <Box color="red">
          <Box color="green" overlap={true} />
        </Box>
      </GestureMonitor>
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
