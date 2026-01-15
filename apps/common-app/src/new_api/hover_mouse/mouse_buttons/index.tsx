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
} from 'react-native-gesture-handler';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, Feedback } from '../../../common';

export default function Buttons() {
  const feedbackRef = useRef<{ showMessage: (msg: string) => void }>(null);

  return (
    <View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.row}>
          <Tests
            name="left"
            color={COLORS.PURPLE}
            mouseButton={MouseButton.LEFT}
            feedbackRef={feedbackRef}
          />
          <Tests
            name="middle"
            color={COLORS.GREEN}
            mouseButton={MouseButton.MIDDLE}
            feedbackRef={feedbackRef}
          />
          <Tests
            name="right"
            color={COLORS.NAVY}
            mouseButton={MouseButton.RIGHT}
            feedbackRef={feedbackRef}
          />
          <Tests
            name="left | right"
            color={COLORS.RED}
            mouseButton={MouseButton.LEFT | MouseButton.RIGHT}
            feedbackRef={feedbackRef}
          />
          <Tests
            name="any"
            color={COLORS.YELLOW}
            mouseButton={MouseButton.ALL}
            feedbackRef={feedbackRef}
          />
        </View>
      </ScrollView>
      <View style={styles.feedbackContainer}>
        <Feedback ref={feedbackRef} />
      </View>
    </View>
  );
}

type TestsProps = {
  name: string;
  color: string;
  mouseButton: MouseButton;
  feedbackRef: React.RefObject<{ showMessage: (msg: string) => void } | null>;
};

function Tests({ name, color, mouseButton, feedbackRef }: TestsProps) {
  const tap = useTapGesture({
    mouseButton,
    onDeactivate: () => {
      feedbackRef.current?.showMessage(`Tap with ${name}`);
    },
    disableReanimated: true,
  });

  const pan = usePanGesture({
    mouseButton,
    onUpdate: () => {
      feedbackRef.current?.showMessage(`Panning with ${name}`);
    },
  });

  const longPress = useLongPressGesture({
    mouseButton,
    onActivate: () => {
      feedbackRef.current?.showMessage(`LongPress with ${name}`);
    },
  });

  const fling = useFlingGesture({
    direction: Directions.LEFT | Directions.RIGHT,
    mouseButton,
    onActivate: () => {
      feedbackRef.current?.showMessage(`Fling with ${name}`);
    },
  });

  const gestures = [tap, longPress, pan, fling];

  const gestureLabels = ['Tap', 'LongPress', 'Pan', 'Fling'];

  return (
    <View style={styles.testColumn}>
      <Text style={styles.title}>{name}</Text>
      <View style={styles.gesturesColumn}>
        {gestures.map((gesture, index) => (
          <View style={styles.gestureItem} key={index}>
            <GestureDetector gesture={gesture as any}>
              <View style={[styles.box, { backgroundColor: color }]}>
                <Text style={styles.gestureLabel}>{gestureLabels[index]}</Text>
              </View>
            </GestureDetector>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  testColumn: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  gesturesColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  gestureItem: {
    marginVertical: 10,
    alignItems: 'center',
  },
  gestureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  box: {
    width: 75,
    height: 75,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    padding: 20,
  },
});
