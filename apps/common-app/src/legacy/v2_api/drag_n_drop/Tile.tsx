import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export interface ColorTile {
  id: string;
  color: string;
}

interface TileProps {
  data: ColorTile;
  draggingActive: boolean;
  tileSize: number;
  isActive: boolean;
}

function Tile({ data, draggingActive, tileSize, isActive }: TileProps) {
  const shakeAnimation = useSharedValue(0);
  const tileScale = useSharedValue(1);
  const draggingActivePrevious = useRef(draggingActive);

  const animateOnDraggingActive = () => {
    shakeAnimation.value = withRepeat(
      withTiming(1, {
        duration: 150,
        easing: Easing.linear,
      }),
      -1
    );
    tileScale.value = withTiming(isActive ? 1.1 : 0.9, {
      duration: 100,
    });
  };

  const animateOnDraggingDisabled = () => {
    tileScale.value = withTiming(1, {
      duration: 100,
    });
    shakeAnimation.value = 0;
  };

  useEffect(() => {
    if (draggingActive && !draggingActivePrevious.current) {
      animateOnDraggingActive();
    }
    if (!draggingActive && draggingActivePrevious.current) {
      animateOnDraggingDisabled();
    }
    draggingActivePrevious.current = draggingActive;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingActive]);

  const tileAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${interpolate(
            shakeAnimation.value,
            [0, 0.3, 0.7, 1],
            [0, -3, 3, 0]
          )}deg`,
        },
        {
          scale: tileScale.value,
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          backgroundColor: data.color,
          width: tileSize,
          height: tileSize,
        },
        tileAnimatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 16,
  },
});

export default Tile;
