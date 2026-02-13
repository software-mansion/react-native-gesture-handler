import React, { useRef } from 'react';
import { View } from 'react-native';
import TestingBase from './testingBase';
import {
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import {
  COLORS,
  commonStyles,
  Feedback,
  FeedbackHandle,
} from '../../../common';

const signalerConfig = {
  duration: 200,
  dampingRatio: 1,
  stiffness: 500,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

export function DelayedPressExample() {
  const feedbackRef = useRef<FeedbackHandle>(null);
  const startColor = COLORS.offWhite;
  const pressColor = COLORS.YELLOW;
  const longPressColor = COLORS.PURPLE;
  const animatedColor = useSharedValue(startColor);

  const pressDelay = 1000;
  const longPressDelay = 1000;

  const onPressIn = () => {
    feedbackRef.current?.showMessage('Pressed with delay');
    animatedColor.value = withSequence(
      withSpring(pressColor, signalerConfig),
      withSpring(startColor, signalerConfig)
    );
  };

  const onLongPress = () => {
    feedbackRef.current?.showMessage('Long pressed with delay');
    animatedColor.value = withSequence(
      withSpring(longPressColor, signalerConfig),
      withSpring(startColor, signalerConfig)
    );
  };

  return (
    <View style={commonStyles.centerView}>
      <View style={commonStyles.row}>
        <TestingBase
          style={[commonStyles.box, { backgroundColor: COLORS.PURPLE }]}
          delayLongPress={longPressDelay}
          unstable_pressDelay={pressDelay}
          onPressIn={onPressIn}
          onLongPress={onLongPress}
        />
      </View>
      <Feedback ref={feedbackRef} />
    </View>
  );
}
