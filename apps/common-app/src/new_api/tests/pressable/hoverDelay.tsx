import React, { useRef } from 'react';
import { View } from 'react-native';
import TestingBase from './testingBase';
import {
  COLORS,
  commonStyles,
  Feedback,
  FeedbackHandle,
} from '../../../common';

export function DelayHoverExample() {
  const feedbackRef = useRef<FeedbackHandle>(null);

  const hoverIn = () => {
    feedbackRef.current?.showMessage('Hover in with delay registered');
  };

  const hoverOut = () => {
    feedbackRef.current?.showMessage('Hover out with delay registered');
  };

  return (
    <View style={commonStyles.centerView}>
      <View style={commonStyles.row}>
        <TestingBase
          style={[commonStyles.box, { backgroundColor: COLORS.PURPLE }]}
          onHoverIn={() => hoverIn()}
          onHoverOut={() => hoverOut()}
          delayHoverIn={500}
          delayHoverOut={500}
        />
      </View>
      <Feedback ref={feedbackRef} />
    </View>
  );
}
