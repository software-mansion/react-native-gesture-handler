import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import {
  commonStyles,
  COLORS,
  Feedback,
  FeedbackHandle,
} from '../../../common';

export default function TapExample() {
  const [isTopActive, setIsTopActive] = useState(false);
  const feedbackRef = useRef<FeedbackHandle>(null);

  const tap = useTapGesture({
    onActivate: () => {
      const message = `${isTopActive ? 'top' : 'bottom'} clicked`;
      feedbackRef.current?.showMessage(message);
      setIsTopActive((prev) => !prev);
    },
    runOnJS: true,
  });

  const noopGesture = useTapGesture({});

  return (
    <View style={commonStyles.centerView}>
      <View style={commonStyles.centerView}>
        <GestureDetector gesture={isTopActive ? tap : noopGesture}>
          <View
            style={[
              commonStyles.box,
              { backgroundColor: isTopActive ? COLORS.RED : COLORS.NAVY },
            ]}>
            {isTopActive ? <Text style={styles.text}>Tap me next</Text> : <></>}
          </View>
        </GestureDetector>
        <GestureDetector gesture={isTopActive ? noopGesture : tap}>
          <View
            style={[
              commonStyles.box,
              { backgroundColor: isTopActive ? COLORS.NAVY : COLORS.RED },
            ]}>
            {!isTopActive ? (
              <Text style={styles.text}>Tap me next</Text>
            ) : (
              <></>
            )}
          </View>
        </GestureDetector>
        <Feedback ref={feedbackRef} />
      </View>
    </View>
  );
}
export const styles = StyleSheet.create({
  text: {
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
