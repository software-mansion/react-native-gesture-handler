import React, { ReactNode, useRef } from 'react';
import { StyleSheet, Text, View, I18nManager } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Swipeable, { SwipeableMethods } from 'src/new_api/swipeable/Swipeable';

interface AppleStyleSwipeableRowProps {
  children?: ReactNode;
}

export default function AppleStyleSwipeableRow({
  children,
}: AppleStyleSwipeableRowProps) {
  const renderLeftActions = (
    _progress: SharedValue<number>,
    dragX: SharedValue<number>
  ) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(
            dragX.value,
            [0, 50, 100, 101],
            [-20, 0, 0, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    }));
    return (
      <RectButton style={styles.leftAction} onPress={close}>
        <Animated.Text style={[styles.actionText, animatedStyle]}>
          Archive
        </Animated.Text>
      </RectButton>
    );
  };

  const renderRightAction = (
    text: string,
    color: string,
    x: number,
    progress: SharedValue<number>,
    totalWidth: number
  ) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(progress.value, [0, -totalWidth], [x, 0]),
        },
      ],
    }));
    const pressHandler = () => {
      close();
      // eslint-disable-next-line no-alert
      window.alert(text);
    };

    return (
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}>
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  };

  const renderRightActions = (_: any, progress: SharedValue<number>) => (
    <View
      style={{
        width: 192,
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      }}>
      {renderRightAction('More', '#C8C7CD', 192, progress, 192)}
      {renderRightAction('Flag', '#ffab00', 128, progress, 192)}
      {renderRightAction('More', '#dd2c00', 64, progress, 192)}
    </View>
  );

  const swipeableRow = useRef<SwipeableMethods>(null);

  const close = () => {
    swipeableRow.current?.close();
  };

  return (
    <Swipeable
      ref={swipeableRow}
      friction={2}
      enableTrackpadTwoFingerGesture
      leftThreshold={30}
      rightThreshold={40}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        console.log(`Opening swipeable from the ${direction}`);
      }}
      onSwipeableClose={(direction) => {
        console.log(`Closing swipeable to the ${direction}`);
      }}>
      {children}
    </Swipeable>
  );
}

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
    padding: 20,
  },
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
