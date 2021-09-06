import React, { useRef } from 'react';
import { Alert, I18nManager, StyleSheet, Text } from 'react-native';
import {
  BetterSwipeable,
  SwipeableController,
  RectButton,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

export const AppleStyleSwipeableRow = (props: {
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
          translateX: Animated.interpolate(
            drag.value,
            [0, 50, 100, 101],
            [-20, 0, 0, 1],
            Extrapolate.CLAMP
          ),
        },
      ],
    }));

    return (
      <RectButton
        style={styles.leftAction}
        onPress={controller?.current?.close}>
        <Animated.View style={animatedStyle}>
          <Text style={styles.actionText}>Archive</Text>
        </Animated.View>
      </RectButton>
    );
  }

  function RenderRightAction(
    text: string,
    color: string,
    x: number,
    progress: Animated.SharedValue<number>
  ) {
    const animatedStyles = useAnimatedStyle(() => ({
      transform: [
        { translateX: Animated.interpolate(progress.value, [0, 1], [x, 0]) },
      ],
    }));

    return (
      <Animated.View style={[animatedStyles, { flex: 1 }]}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={() => {
            Alert.alert(text);
            controller?.current?.close();
          }}>
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  }

  function RightActions(
    progress: Animated.SharedValue<number>,
    _drag: Animated.SharedValue<number>
  ) {
    return (
      <Animated.View
        style={{
          width: 192,
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        }}>
        {RenderRightAction('More', '#C8C7CD', 192, progress)}
        {RenderRightAction('Flag', '#ffab00', 128, progress)}
        {RenderRightAction('More', '#dd2c00', 64, progress)}
      </Animated.View>
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
    backgroundColor: '#497AFC',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
