// This component is based on RN's DrawerLayoutAndroid API
// It's cross-compatible with all platforms despite
// `DrawerLayoutAndroid` only being available on android

import React, {
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import { StyleSheet } from 'react-native';

import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { GestureObjects as Gesture } from '../handlers/gestures/gestureObjects';
import { GestureDetector } from '../handlers/gestures/GestureDetector';

export interface DrawerLayoutProps {
  children?: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DrawerLayoutMethods {}

const DrawerLayout = forwardRef<DrawerLayoutMethods, DrawerLayoutProps>(
  function DrawerLayout(props: DrawerLayoutProps) {
    const overlayColor = 'rgba(0, 0, 0, 0.7)';

    const isDrawerOpen = useSharedValue(false);

    const overlayAnimatedProps = useAnimatedProps(() => {
      console.log(
        'updated pointerEvents to',
        isDrawerOpen.value ? 'auto' : 'none'
      );
      return {
        pointerEvents: isDrawerOpen.value
          ? ('auto' as const)
          : ('none' as const),
      };
    });

    const animateDrawer = useCallback(() => {
      'worklet';
      console.log('setting drawer open value to true');
      isDrawerOpen.value = true;
    }, [isDrawerOpen]);

    useEffect(() => animateDrawer(), [animateDrawer]);

    const overlayDismissGesture = useMemo(
      () =>
        Gesture.Tap().onFinalize((_, success) =>
          console.log('drawer', success ? 'activated [GOOD]' : 'canceled')
        ),
      []
    );

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
      opacity: 1,
      backgroundColor: overlayColor,
    }));

    return (
      <GestureDetector gesture={overlayDismissGesture}>
        <Animated.View style={StyleSheet.absoluteFillObject}>
          {props.children}
          <Animated.View
            animatedProps={overlayAnimatedProps}
            style={[StyleSheet.absoluteFillObject, overlayAnimatedStyle]}
          />
        </Animated.View>
      </GestureDetector>
    );
  }
);

export default DrawerLayout;
