import { COLORS, Feedback, commonStyles } from '../../../common';
import {
  InterceptingGestureDetector,
  VirtualGestureDetector,
  useTapGesture,
} from 'react-native-gesture-handler';
import React, { useRef } from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';
import { View } from 'react-native';

export default function LogicDetectorExample() {
  const feedbackRef = useRef<{ showMessage: (msg: string) => void }>(null);

  const circleElementTap = useTapGesture({
    onActivate: () => {
      feedbackRef.current?.showMessage('Tapped circle!');
    },
    disableReanimated: true,
  });

  const rectElementTap = useTapGesture({
    onActivate: () => {
      feedbackRef.current?.showMessage('Tapped parallelogram!');
    },
    disableReanimated: true,
  });

  const containerTap = useTapGesture({
    onActivate: () => {
      feedbackRef.current?.showMessage('Tapped container!');
    },
    disableReanimated: true,
  });

  // onPress must be set to enable gesture recognition on svg
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = () => {};

  return (
    <View style={commonStyles.centerView}>
      <InterceptingGestureDetector gesture={containerTap}>
        <Svg
          height="250"
          width="250"
          style={{ backgroundColor: COLORS.PURPLE }}>
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
      <Feedback ref={feedbackRef} />
    </View>
  );
}
