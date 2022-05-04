import React from 'react';
import { StyleSheet } from 'react-native';
import {
  PanGestureHandlerEventPayload,
  Gesture,
  GestureDetector,
  PanGesture,
  TapGesture,
} from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle } from 'react-native-reanimated';

type AnimatedPostion = {
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
};

interface DraggableProps {
  id: string;
  onLongPress: (id: string) => void;
  onPositionUpdate: (e: PanGestureHandlerEventPayload) => void;
  enabled: boolean;
  isActive: boolean;
  translation: AnimatedPostion;
  position: { x: number; y: number };
  dragGesture: PanGesture;
  tapEndGesture: TapGesture;
  tileSize: number;
  rowGap: number;
  columnGap: number;
  children?: React.ReactNode;
}

const Draggable = ({
  id,
  children,
  onLongPress,
  isActive,
  translation,
  dragGesture,
  tapEndGesture,
  columnGap,
  rowGap,
  position,
}: DraggableProps) => {
  const tapGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => runOnJS(onLongPress)(id))
    .simultaneousWithExternalGesture(dragGesture)
    .simultaneousWithExternalGesture(tapEndGesture);

  const translateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: isActive ? translation.x.value : 0,
        },
        {
          translateY: isActive ? translation.y.value : 0,
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          isActive
            ? { ...styles.absolute, left: position.x, top: position.y }
            : { marginHorizontal: columnGap / 2, marginVertical: rowGap / 2 },
          translateStyle,
        ]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    zIndex: 10,
  },
});

export default Draggable;
