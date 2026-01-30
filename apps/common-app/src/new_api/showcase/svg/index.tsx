import { COLORS, commonStyles, Feedback } from '../../../common';
import React, { useRef } from 'react';
import { View } from 'react-native';
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
        <View style={{ backgroundColor: COLORS.PURPLE }}>
          <Svg height="250" width="250" onPress={noop}>
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
        </View>
      </InterceptingGestureDetector>
      <Feedback ref={feedbackRef} />
    </View>
  );
}
