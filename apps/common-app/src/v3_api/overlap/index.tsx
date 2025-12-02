import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  GestureDetector,
  InterceptingGestureDetector,
  useTapGesture,
  VirtualGestureDetector,
} from 'react-native-gesture-handler';

function Box(props: {
  color: string;
  overlap?: boolean;
  children?: React.ReactNode;
  elevated: boolean;
}) {
  return (
    <View
      style={[
        styles.box,
        { backgroundColor: props.color },
        props.overlap ? styles.overlap : {},
        props.elevated ? styles.elevated : {},
      ]}>
      {props.children}
    </View>
  );
}

function OverlapSiblings() {
  const [elevated, setElevated] = React.useState('');

  const tapRed = useTapGesture({
    onDeactivate: (_e, success) => {
      'worklet';
      if (success) {
        setElevated('red');
      }
    },
    disableReanimated: true,
  });

  const tapGreen = useTapGesture({
    onDeactivate: (_e, success) => {
      'worklet';
      if (success) {
        setElevated('green');
      }
    },
    disableReanimated: true,
  });

  return (
    <View style={styles.row}>
      <Text style={styles.text}>Overlap Siblings</Text>
      <View style={{ width: 225 }}>
        <GestureDetector gesture={tapRed}>
          <Box color="#fa7f7c" elevated={elevated === 'red'} />
        </GestureDetector>
        <GestureDetector gesture={tapGreen}>
          <Box color="#57b495" overlap elevated={elevated === 'green'} />
        </GestureDetector>
      </View>
    </View>
  );
}

function OverlapParents() {
  const [elevated, setElevated] = React.useState('');

  const tapRed = useTapGesture({
    onDeactivate: (_e, success) => {
      'worklet';
      console.log('tap red');
      if (success) {
        setElevated('red');
      }
    },
    disableReanimated: true,
  });

  const tapGreen = useTapGesture({
    onDeactivate: (_e, success) => {
      console.log('tap green');
      if (success) {
        setElevated('green');
      }
    },
    disableReanimated: true,
  });

  return (
    <View style={styles.row}>
      <Text style={styles.text}>Overlap Child</Text>
      <View style={{ width: 225 }}>
        <InterceptingGestureDetector gesture={tapRed}>
          <Box color="#fa7f7c" elevated={elevated === 'red'}>
            <VirtualGestureDetector gesture={tapGreen}>
              <Box color="#57b495" overlap elevated={elevated === 'green'} />
            </VirtualGestureDetector>
          </Box>
        </InterceptingGestureDetector>
      </View>
    </View>
  );
}

export default function Example() {
  return (
    <View style={styles.container}>
      <OverlapSiblings />
      <OverlapParents />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    padding: 30,
    alignItems: 'center',
    height: 225,
    marginTop: 48,
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
  text: {
    fontSize: 24,
    margin: 4,
  },
  elevated: {
    zIndex: 10,
    elevation: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
});
