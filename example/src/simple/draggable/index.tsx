import React, { FC } from 'react';
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import Animated, { useSharedValue } from 'react-native-reanimated';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type DraggableBoxProps = {
  minDist?: number;
  boxStyle?: StyleProp<ViewStyle>;
};

export const DraggableBox: FC<DraggableBoxProps> = (props) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .minDistance(props.minDist || 0)
    .onUpdate((e) => {
      translateX.value = x.value + e.translationX;
      translateY.value = y.value + e.translationY;
    })
    .onEnd(() => {
      x.value = translateX.value;
      y.value = translateY.value;
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.box,
          props.boxStyle,
          {
            top: translateY,
            left: translateX,
          },
        ]}
      />
    </GestureDetector>
  );
};

export default function Example() {
  return (
    <ScrollView style={styles.scrollView}>
      <DraggableBox />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  box: {
    width: 150,
    height: 150,
    position: 'absolute',
    backgroundColor: 'plum',
    margin: 10,
  },
});
