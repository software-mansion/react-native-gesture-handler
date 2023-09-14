import React, {FC} from 'react';
import {ScrollView, StyleProp, StyleSheet, ViewStyle} from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {LoremIpsum} from '../../common';

type DraggableBoxProps = {
  minDist?: number;
  boxStyle?: StyleProp<ViewStyle>;
};

export const DraggableBox: FC<DraggableBoxProps> = props => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {translateY: translateY.value},
        {translateX: translateX.value},
      ],
    };
  }, []);

  const panGesture = Gesture.Pan()
    .minDistance(props.minDist || 0)
    .onUpdate(e => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, style, props.boxStyle]} />
    </GestureDetector>
  );
};

export default function Example() {
  return (
    <ScrollView style={styles.scrollView}>
      <LoremIpsum words={40} />
      <DraggableBox />
      <LoremIpsum />
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
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
  },
});
