import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  GestureDetector,
  PointerType,
  usePanGesture,
} from 'react-native-gesture-handler';
import {
  commonStyles,
  COLORS,
  Feedback,
  FeedbackHandle,
} from '../../../common';

const Colors = {
  Touch: COLORS.GREEN,
  Stylus: COLORS.YELLOW,
  Mouse: COLORS.PURPLE,
};

interface CircleProps {
  feedbackRef: React.RefObject<FeedbackHandle | null>;
}

function Circle({ feedbackRef }: CircleProps) {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const progress = useSharedValue(0);

  const currentColor = useSharedValue(Colors.Touch);
  const prevColor = useSharedValue(Colors.Touch);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translationX.value },
        { translateY: translationY.value },
      ],
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [prevColor.value, currentColor.value]
      ),
    };
  });

  const panGesture = usePanGesture({
    onActivate: (e) => {
      progress.value = 0;
      prevColor.value = currentColor.value;

      let typeLabel = 'Touch';
      switch (e.pointerType) {
        case PointerType.TOUCH:
          currentColor.value = Colors.Touch;
          typeLabel = 'Touch';
          break;
        case PointerType.STYLUS:
          currentColor.value = Colors.Stylus;
          typeLabel = 'Stylus';
          break;
        case PointerType.MOUSE:
          currentColor.value = Colors.Mouse;
          typeLabel = 'Mouse';
          break;
      }

      feedbackRef.current?.showMessage(typeLabel);
      progress.value = withTiming(1, { duration: 250 });
    },
    onUpdate: (e) => {
      translationX.value += e.changeX;
      translationY.value += e.changeY;
    },
    minDistance: 0,
    runOnJS: true,
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.circle, style]} />
    </GestureDetector>
  );
}

export default function Example() {
  const feedbackRef = useRef<FeedbackHandle>(null);

  return (
    <View style={commonStyles.centerView}>
      <View style={styles.circleContainer}>
        <Circle feedbackRef={feedbackRef} />
        <Feedback ref={feedbackRef} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: COLORS.NAVY,
  },
});
