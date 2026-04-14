import React, { useRef } from 'react';
import { Platform, View } from 'react-native';
import TestingBase from './testingBase';
import {
  COLORS,
  commonStyles,
  Feedback,
  FeedbackHandle,
} from '../../../common';

export function RippleExample() {
  const feedbackRef = useRef<FeedbackHandle>(null);

  const buttonOpacity =
    Platform.OS === 'android' ? { opacity: 1 } : { opacity: 0.6 };

  const handlePress = () => {
    feedbackRef.current?.showMessage('Pressed with Ripple effect');
  };

  return (
    <View style={[commonStyles.centerView]}>
      <View style={commonStyles.row}>
        <TestingBase
          onPress={handlePress}
          style={[
            commonStyles.box,
            buttonOpacity,
            { backgroundColor: COLORS.PURPLE },
          ]}
          android_ripple={{
            color: COLORS.GREEN,
            borderless: false,
            foreground: false,
          }}
        />
      </View>
      <Feedback ref={feedbackRef} />
    </View>
  );
}
