import React, { FunctionComponent, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  PanGestureHandlerEventPayload,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

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
  dragGesture: any;
  tileSize: number;
  rowGap: number;
  columnGap: number;
}

const Draggable: FunctionComponent<DraggableProps> = ({
  id,
  children,
  onLongPress,
  isActive,
  translation,
  dragGesture,
  columnGap,
  rowGap,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const elementRef = useRef<Animated.View>(null);
  const measurePosition = () => {
    elementRef?.current?.measure((x: number, y: number) => {
      console.log(x, y);
      setPosition({ x, y });
      onLongPress(id);
    });
  };

  const tapGesture = Gesture.LongPress()
    .minDuration(300)
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      measurePosition();
    })
    .simultaneousWithExternalGesture(dragGesture);

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
        ref={elementRef}
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
