import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { COLORS, commonStyles } from '../../../common';

function useIndexedLogger() {
  const messageCounter = useRef(0);

  const logMessage = (message: string) => {
    messageCounter.current += 1;
    const indexedMessage = `${messageCounter.current}. ${message}`;
    console.log(indexedMessage);
  };

  const logMessageWorklet = (message: string) => {
    'worklet';
    // Schedule log on the JS thread so the console interceptor can pick it up
    scheduleOnRN(logMessage, message);
  };

  return logMessageWorklet;
}

export default function TapExample() {
  const [count, setCount] = useState(0);
  const colorProgress = useSharedValue(0);
  const log = useIndexedLogger();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        [COLORS.NAVY, COLORS.KINDA_BLUE]
      ),
    };
  });

  const tapGesture = useTapGesture({
    onBegin: () => {
      log('onBegin');
      colorProgress.value = withTiming(1, {
        duration: 100,
      });
    },
    onActivate: () => {
      log('onActivate');
      scheduleOnRN(setCount, count + 1);
    },
    onDeactivate: () => {
      log('onDeactivate');
    },
    onFinalize: () => {
      log('onFinalize');
      colorProgress.value = withTiming(0, {
        duration: 100,
      });
    },
  });

  return (
    <View style={commonStyles.centerView}>
      <Text style={commonStyles.header}>Tap count: {count}</Text>
      <GestureDetector gesture={tapGesture}>
        <Animated.View
          testID="tap-box"
          style={[commonStyles.box, animatedStyle]}
        />
      </GestureDetector>
    </View>
  );
}
