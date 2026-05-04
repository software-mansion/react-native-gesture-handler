import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  useCompetingGestures,
  useLongPressGesture,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export default function CompetingGestures() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const BOX_SIZE = 200;
  const MAX_X = screenWidth / 2 - BOX_SIZE / 2;
  const MAX_Y = screenHeight / 2 - BOX_SIZE / 2;
  const [text, setText] = useState('Idle');
  const isPanActive = useSharedValue(false);
  const isPressActive = useSharedValue(false);
  const posX = useSharedValue(0);
  const posY = useSharedValue(0);

  const setPanActive = () => {
    isPanActive.value = true;
    setText('Pan active');
  };
  const setPanInactive = () => {
    isPanActive.value = false;
    setText('Idle');
  };
  const setLongPressActive = () => {
    isPressActive.value = true;
    setText('Long press active');
  };
  const setLongPressInactive = () => {
    isPressActive.value = false;
    setText('Idle');
  };
  const panGesture = usePanGesture({
    onActivate: () => {
      'worklet';
      scheduleOnRN(setPanActive);
    },
    onUpdate: (event) => {
      'worklet';
      const newX = posX.value + event.changeX;
      const newY = posY.value + event.changeY;

      posX.value = Math.max(-MAX_X, Math.min(MAX_X, newX));
      posY.value = Math.max(-MAX_Y, Math.min(MAX_Y, newY));
    },
    onDeactivate: () => {
      'worklet';
      scheduleOnRN(setPanInactive);
    },
  });
  const pressGesture = useLongPressGesture({
    onActivate: () => {
      'worklet';
      scheduleOnRN(setLongPressActive);
    },
    onDeactivate: () => {
      'worklet';
      scheduleOnRN(setLongPressInactive);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    let bg = 'purple';
    if (isPanActive.value) {
      bg = 'cyan';
    } else if (isPressActive.value) {
      bg = 'orange';
    }
    return {
      transform: [{ translateX: posX.value }, { translateY: posY.value }],
      backgroundColor: bg,
    };
  });

  const gesture = useCompetingGestures(panGesture, pressGesture);

  return (
    <View style={styles.container}>
      <Text>{text}</Text>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.outerBox, animatedStyle]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBox: {
    width: 200,
    height: 200,
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
