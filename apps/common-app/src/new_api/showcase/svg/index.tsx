import { COLORS, Feedback } from '../../../common';
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  InterceptingGestureDetector,
  useTapGesture,
  VirtualGestureDetector,
} from 'react-native-gesture-handler';
import Svg, { Circle, Rect } from 'react-native-svg';

export default function LogicDetectorExample() {
  const feedbackRef = useRef<{ showMessage: (msg: string) => void }>(null);

  const circleElementTap = useTapGesture({
    onActivate: () => {
      'worklet';
      feedbackRef.current?.showMessage('Tapped circle!');
    },
    disableReanimated: true,
  });

  const rectElementTap = useTapGesture({
    onActivate: () => {
      'worklet';
      feedbackRef.current?.showMessage('Tapped parallelogram!');
    },
    disableReanimated: true,
  });

  const containerTap = useTapGesture({
    onActivate: () => {
      'worklet';
      feedbackRef.current?.showMessage('Tapped container!');
    },
    disableReanimated: true,
  });

  // onPress must be set to enable gesture recognition on svg
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = () => {};

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: COLORS.PURPLE }}>
        <InterceptingGestureDetector gesture={containerTap}>
          <Svg height="250" width="250">
            <VirtualGestureDetector gesture={circleElementTap}>
              <Circle
                cx="125"
                cy="125"
                r="125"
                fill={COLORS.NAVY}
                onPress={noop}
              />
            </VirtualGestureDetector>
            <VirtualGestureDetector gesture={rectElementTap}>
              <Rect
                skewX="45"
                width="125"
                height="250"
                fill={COLORS.KINDA_BLUE}
                onPress={noop}
              />
            </VirtualGestureDetector>
          </Svg>
        </InterceptingGestureDetector>
      </View>
      <Feedback ref={feedbackRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
});
