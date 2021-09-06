import React, { useRef } from 'react';
import { I18nManager, StyleSheet } from 'react-native';
import {
  BetterSwipeable,
  RectButton,
  SwipeableController,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

export const GmailStyleSwipeableRow = (props: {
  children: React.ReactNode;
}) => {
  const controller = useRef<SwipeableController>(null);

  function LeftActions(
    _progress: Animated.SharedValue<number>,
    drag: Animated.SharedValue<number>
  ) {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: Animated.interpolate(
            drag.value,
            [0, 80],
            [0, 1],
            Extrapolate.CLAMP
          ),
        },
      ],
    }));

    return (
      <RectButton
        style={styles.leftAction}
        onPress={controller?.current?.close}>
        {/* Change it to some icons */}
        <Animated.View style={[styles.actionIcon, animatedStyle]} />
      </RectButton>
    );
  }

  function RightActions(
    _progress: Animated.SharedValue<number>,
    drag: Animated.SharedValue<number>
  ) {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: Animated.interpolate(
            drag.value,
            [-80, 0],
            [1, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    }));

    return (
      <RectButton
        style={styles.rightAction}
        onPress={controller?.current?.close}>
        {/* Change it to some icons */}
        <Animated.View style={[styles.actionIcon, animatedStyle]} />
      </RectButton>
    );
  }

  return (
    <BetterSwipeable
      ref={controller}
      renderLeftActions={LeftActions}
      renderRightActions={RightActions}>
      {props.children}
    </BetterSwipeable>
  );
};

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#388e3c',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
    backgroundColor: 'plum',
    height: 20,
  },
  rightAction: {
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    backgroundColor: '#dd2c00',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
