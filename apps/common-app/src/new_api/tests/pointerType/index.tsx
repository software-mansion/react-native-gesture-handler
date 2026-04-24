import React, { useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  GestureDetector,
  PointerType,
  useLongPressGesture,
} from 'react-native-gesture-handler';
import {
  commonStyles,
  COLORS,
  Feedback,
  FeedbackHandle,
} from '../../../common';

const Colors = {
  Default: COLORS.NAVY,
  Touch: COLORS.GREEN,
  Stylus: COLORS.YELLOW,
  Mouse: COLORS.PURPLE,
};

interface BoxProps {
  feedbackRef: React.RefObject<FeedbackHandle | null>;
}

function Box({ feedbackRef }: BoxProps) {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const progress = useSharedValue(0);

  const currentColor = useSharedValue(Colors.Default);
  const prevColor = useSharedValue(Colors.Default);

  const animatedStyle = useAnimatedStyle(() => {
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

  const panGesture = useLongPressGesture({
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
        default:
          currentColor.value = Colors.Touch;
      }

      feedbackRef.current?.showMessage(typeLabel);
      progress.value = withTiming(1, { duration: 250 });
    },
    onDeactivate: () => {
      translationX.value = withTiming(0);
      translationY.value = withTiming(0);

      prevColor.value = currentColor.value;
      currentColor.value = Colors.Default;
      progress.value = 0;
      progress.value = withTiming(1, { duration: 500 });
    },
    minDuration: 0,
    runOnJS: true,
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[commonStyles.box, animatedStyle]} />
    </GestureDetector>
  );
}

export default function Example() {
  const feedbackRef = useRef<FeedbackHandle>(null);

  return (
    <View style={commonStyles.centerView}>
      <Box feedbackRef={feedbackRef} />
      <Feedback ref={feedbackRef} />
    </View>
  );
}
