import { COLORS, commonStyles } from '../../../common';
import React from 'react';
import { View } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  useLongPressGesture,
  GestureStateManager,
  LongPressGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export default function TwoPressables() {
  const isActivated = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];
  const gestures: LongPressGesture[] = [];

  const createGestureConfig = (index: number) => ({
    onActivate: () => {
      'worklet';
      isActivated[index].value = 1;
      console.log(`Box ${index}: long pressed`);

      const nextIndex = index + 1;
      if (nextIndex < gestures.length) {
        const nextGesture = gestures[nextIndex];
        if (nextGesture) {
          GestureStateManager.activate(nextGesture.handlerTag);
        }
      }
    },
    onFinalize: () => {
      'worklet';
      isActivated[index].value = 0;
      const nextIndex = index + 1;
      if (nextIndex < gestures.length) {
        const nextGesture = gestures[nextIndex];
        if (nextGesture) {
          GestureStateManager.deactivate(nextGesture.handlerTag);
        }
      }
    },
    disableReanimated: true,
  });

  const g0 = useLongPressGesture(createGestureConfig(0));
  const g1 = useLongPressGesture(createGestureConfig(1));
  const g2 = useLongPressGesture(createGestureConfig(2));
  const g3 = useLongPressGesture(createGestureConfig(3));

  gestures[0] = g0;
  gestures[1] = g1;
  gestures[2] = g2;
  gestures[3] = g3;

  const colors = [COLORS.PURPLE, COLORS.NAVY, COLORS.GREEN, COLORS.RED];

  function Box({ index }: { index: number }) {
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: isActivated[index].value === 1 ? 0.5 : 1,
      transform: [
        { scale: withTiming(isActivated[index].value === 1 ? 0.95 : 1) },
      ],
    }));

    return (
      <GestureDetector gesture={gestures[index]}>
        <Animated.View
          style={[
            commonStyles.box,
            { backgroundColor: colors[index] },
            animatedStyle,
          ]}
        />
      </GestureDetector>
    );
  }
  return (
    <GestureHandlerRootView>
      <View style={commonStyles.centerView}>
        <Box index={0} />
        <Box index={1} />
        <Box index={2} />
        <Box index={3} />
      </View>
    </GestureHandlerRootView>
  );
}
