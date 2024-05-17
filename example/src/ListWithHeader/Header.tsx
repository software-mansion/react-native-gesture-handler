import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  Easing,
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

export const HEADER_HEIGHT = Platform.OS === 'web' ? 64 : 192;
export const COLLAPSED_HEADER_HEIGHT = 64;

export interface HeaderProps {
  scrollOffset: SharedValue<number>;
}

export default function Header(props: HeaderProps) {
  if (Platform.OS === 'web') {
    return <HeaderWeb {...props} />;
  }
  return <HeaderNative {...props} />;
}

function HeaderNative(props: HeaderProps) {
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

  const isMounted = useSharedValue(false);
  const opacity = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
    };
  });

  const signetStyle = useAnimatedStyle(() => {
    const size = isMounted.value ? measure(containerRef) : undefined;
    const imageSize = interpolate(
      expandFactor.value,
      [0, 1],
      [headerHeight.value * 0.7, headerHeight.value * 0.5]
    );
    const clampedHeight = Math.min(headerHeight.value, HEADER_HEIGHT);

    return {
      position: 'absolute',
      width: imageSize,
      height: imageSize,
      top: interpolate(
        Math.sqrt(expandFactor.value),
        [0, 1],
        [clampedHeight * 0.1, 0]
      ),
      left: interpolate(
        expandFactor.value,
        [0, 1],
        [COLLAPSED_HEADER_HEIGHT * 0.25, ((size?.width ?? 0) - imageSize) * 0.5]
      ),
      opacity: opacity.value,
      transform: [{ translateY: (1 - opacity.value) * 20 }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const size = isMounted.value ? measure(containerRef) : undefined;
    const height = interpolate(
      expandFactor.value,
      [0, 1],
      [headerHeight.value * 0.7, headerHeight.value * 0.5]
    );
    const width = (size?.width ?? 0) * (expandFactor.value * 0.2 + 0.4);

    return {
      position: 'absolute',
      width: width,
      height: height,
      bottom: interpolate(
        expandFactor.value,
        [0, 1],
        [COLLAPSED_HEADER_HEIGHT * 0.2, 0]
      ),
      left: ((size?.width ?? 0) - width) * 0.5,
      opacity: opacity.value,
      transform: [{ translateY: (1 - opacity.value) * 20 }],
    };
  });

  useEffect(() => {
    setTimeout(() => {
      isMounted.value = true;
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    }, 100);
  }, [opacity, isMounted]);

  return (
    <Animated.View
      ref={containerRef}
      collapsable={false}
      style={[headerStyle, styles.nativeHeader]}>
      <Animated.Image
        source={SIGNET}
        style={signetStyle}
        resizeMode="contain"
      />
      <Animated.Image source={TEXT} style={textStyle} resizeMode="contain" />
    </Animated.View>
  );
}

function HeaderWeb(_props: HeaderProps) {
  return (
    <Animated.View collapsable={false} style={styles.webHeader}>
      <Animated.Image
        source={SIGNET}
        style={styles.webSignet}
        resizeMode="contain"
      />
      <Animated.Image
        source={TEXT}
        style={styles.webText}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  nativeHeader: {
    width: '100%',
    position: 'absolute',
    backgroundColor: '#f8f9ff',
    zIndex: 100,
    flexDirection: 'row',
  },
  webHeader: {
    width: '100%',
    position: 'absolute',
    backgroundColor: '#f8f9ff',
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 16,
    height: HEADER_HEIGHT,
  },
  webSignet: {
    width: 48,
    height: 48,
  },
  webText: {
    width: 170,
    height: 32,
  },
});
