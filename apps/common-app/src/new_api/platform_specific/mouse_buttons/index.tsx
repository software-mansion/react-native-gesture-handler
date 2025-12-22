import React, { useRef } from 'react';
import {
  GestureDetector,
  MouseButton,
  Directions,
  ScrollView,
  useTapGesture,
  usePanGesture,
  useLongPressGesture,
  useFlingGesture,
  SingleGesture,
} from 'react-native-gesture-handler';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, Feedback } from '../../../common';

const COLORS_ARR = [
  COLORS.PURPLE,
  COLORS.GREEN,
  COLORS.NAVY,
  COLORS.RED,
  COLORS.KINDA_RED,
];
export default function Buttons() {
  const feedbackRef = useRef<{ showMessage: (msg: string) => void }>(null);
  type TestProps = {
    name: string;
    gestures: SingleGesture[];
  };

  function Test({ name, gestures }: TestProps) {
    return (
      <View style={styles.center}>
        <Text>{name}</Text>
        <View style={[styles.row, styles.center]}>
          {gestures.map((handler, index) => {
            return (
              <View style={styles.rowItem} key={index}>
                <GestureDetector gesture={handler as any} key={index}>
                  <View
                    style={[styles.box, { backgroundColor: COLORS_ARR[index] }]}
                  />
                </GestureDetector>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  function TapTests() {
    const leftTap = useTapGesture({
      mouseButton: MouseButton.LEFT,
      onDeactivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Tap with left');
      },
      disableReanimated: true,
    });

    const middleTap = useTapGesture({
      mouseButton: MouseButton.MIDDLE,
      onDeactivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Tap with middle');
      },
      disableReanimated: true,
    });

    const rightTap = useTapGesture({
      mouseButton: MouseButton.RIGHT,
      onDeactivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Tap with right');
      },
      disableReanimated: true,
    });

    const leftRightTap = useTapGesture({
      mouseButton: MouseButton.LEFT | MouseButton.RIGHT,
      onDeactivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Tap with left | right');
      },
      disableReanimated: true,
    });

    const allTap = useTapGesture({
      mouseButton: MouseButton.ALL,
      onDeactivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Tap with any button');
      },
      disableReanimated: true,
    });

    const gestures = [leftTap, middleTap, rightTap, leftRightTap, allTap];

    return <Test name={'Tap'} gestures={gestures} />;
  }

  function PanTests() {
    const leftPan = usePanGesture({
      mouseButton: MouseButton.LEFT,
      onUpdate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Panning with left');
      },
    });

    const middlePan = usePanGesture({
      mouseButton: MouseButton.MIDDLE,
      onUpdate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Panning with middle');
      },
    });

    const rightPan = usePanGesture({
      mouseButton: MouseButton.RIGHT,
      onUpdate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Panning with right');
      },
    });

    const leftRightPan = usePanGesture({
      mouseButton: MouseButton.LEFT | MouseButton.RIGHT,
      onUpdate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Panning with left | right');
      },
    });

    const allPan = usePanGesture({
      mouseButton: MouseButton.ALL,
      onUpdate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Panning with any button');
      },
    });

    const gestures = [leftPan, middlePan, rightPan, leftRightPan, allPan];

    return <Test name={'Pan'} gestures={gestures} />;
  }

  function LongPressTests() {
    const leftLongPress = useLongPressGesture({
      mouseButton: MouseButton.LEFT,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('LongPress with left');
      },
    });

    const middleLongPress = useLongPressGesture({
      mouseButton: MouseButton.MIDDLE,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('LongPress with middle');
      },
    });

    const rightLongPress = useLongPressGesture({
      mouseButton: MouseButton.RIGHT,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('LongPress with right');
      },
    });

    const leftRightLongPress = useLongPressGesture({
      mouseButton: MouseButton.LEFT | MouseButton.RIGHT,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('LongPress with left | right');
      },
    });

    const allLongPress = useLongPressGesture({
      mouseButton: MouseButton.ALL,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('LongPress with any button');
      },
    });

    const gestures = [
      leftLongPress,
      middleLongPress,
      rightLongPress,
      leftRightLongPress,
      allLongPress,
    ];

    return <Test name={'LongPress'} gestures={gestures} />;
  }

  function FlingTests() {
    const leftFling = useFlingGesture({
      direction: Directions.LEFT | Directions.RIGHT,
      mouseButton: MouseButton.LEFT,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Fling with left');
      },
    });

    const middleFling = useFlingGesture({
      direction: Directions.LEFT | Directions.RIGHT,
      mouseButton: MouseButton.MIDDLE,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Fling with middle');
      },
    });

    const rightFling = useFlingGesture({
      direction: Directions.LEFT | Directions.RIGHT,
      mouseButton: MouseButton.RIGHT,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Fling with right');
      },
    });

    const leftRightFling = useFlingGesture({
      direction: Directions.LEFT | Directions.RIGHT,
      mouseButton: MouseButton.LEFT | MouseButton.RIGHT,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Fling with left | right');
      },
    });

    const allFling = useFlingGesture({
      direction: Directions.LEFT | Directions.RIGHT,
      mouseButton: MouseButton.ALL,
      onActivate: () => {
        'worklet';
        feedbackRef.current?.showMessage('Fling with any button');
      },
    });

    const gestures = [
      leftFling,
      middleFling,
      rightFling,
      leftRightFling,
      allFling,
    ];

    return <Test name={'Fling'} gestures={gestures} />;
  }

  const Titles = () => {
    return (
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.title}>Left</Text>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.title}>Middle</Text>
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.title}>Right</Text>
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.title}>Left or right</Text>
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.title}>Any button</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <Titles />
      <TapTests />
      <PanTests />
      <LongPressTests />
      <FlingTests />
      <View style={styles.center}>
        <Feedback ref={feedbackRef} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  box: {
    width: 75,
    height: 75,
  },
  row: {
    padding: 10,
    width: '100%',
    flexDirection: 'row',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  rowItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    borderRightWidth: 2,
  },
});
