import React, { useEffect } from 'react';
import Animated, {
  SharedValue,
  interpolate,
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const SIGNET = require('./signet.png');
const TEXT = require('./text.png');

export const HEADER_HEIGHT = 192;
export const COLLAPSED_HEADER_HEIGHT = 96;

export interface HeaderProps {
  scrollOffset: SharedValue<number>;
}

export default function Header(props: HeaderProps) {
  const containerRef = useAnimatedRef();
  const headerHeight = useDerivedValue(() => {
    return Math.max(
      HEADER_HEIGHT - props.scrollOffset.value,
      COLLAPSED_HEADER_HEIGHT
    );
  });

  const expandFactor = useDerivedValue(() => {
    return Math.min(
      1,
      (headerHeight.value - COLLAPSED_HEADER_HEIGHT) /
        (HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT)
    );
  });

  const opacity = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
    };
  });

  const signetStyle = useAnimatedStyle(() => {
    const size = measure(containerRef);
    const imageSize = headerHeight.value * 0.5;
    const clampedHeight = Math.min(headerHeight.value, HEADER_HEIGHT);

    return {
      position: 'absolute',
      width: imageSize,
      height: imageSize,
      top: interpolate(
        Math.sqrt(expandFactor.value),
        [0, 1],
        [clampedHeight * 0.25, 0]
      ),
      left: interpolate(
        expandFactor.value,
        [0, 1],
        [COLLAPSED_HEADER_HEIGHT * 0.25, ((size?.width ?? 0) - imageSize) * 0.5]
      ),
      opacity: opacity.value,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const size = measure(containerRef);
    const height = headerHeight.value * 0.5;
    const width = (size?.width ?? 0) * (expandFactor.value * 0.2 + 0.4);

    return {
      position: 'absolute',
      width: width,
      height: height,
      bottom: interpolate(
        expandFactor.value,
        [0, 1],
        [COLLAPSED_HEADER_HEIGHT * 0.25, 0]
      ),
      left: ((size?.width ?? 0) - width) * 0.5,
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 100 });
  }, [opacity]);

  return (
    <Animated.View
      ref={containerRef}
      collapsable={false}
      style={[
        headerStyle,
        {
          width: '100%',
          position: 'absolute',
          backgroundColor: '#f8f9ff',
          zIndex: 100,
          flexDirection: 'row',
        },
      ]}>
      <Animated.Image
        source={SIGNET}
        style={signetStyle}
        resizeMode="contain"
      />
      <Animated.Image source={TEXT} style={textStyle} resizeMode="contain" />
    </Animated.View>
  );
}
