import React, { ReactNode, useRef } from 'react';
import { StyleSheet, I18nManager } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Swipeable, { SwipeableMethods } from 'src/new_api/swipeable/Swipeable';

interface GmailStyleSwipeableRowProps {
  children?: ReactNode;
}

export default function GmailStyleSwipeableRow({
  children,
}: GmailStyleSwipeableRowProps) {
  const renderLeftActions = (
    _progress: SharedValue<number>,
    dragX: SharedValue<number>
  ) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: interpolate(dragX.value, [0, 80], [0, 1], Extrapolation.CLAMP),
        },
      ],
    }));

    return (
      <RectButton style={styles.leftAction} onPress={close}>
        {/* Change it to some icons */}
        <Animated.View style={[styles.actionIcon, animatedStyle]} />
      </RectButton>
    );
  };

  const renderRightActions = (
    _progress: SharedValue<number>,
    dragX: SharedValue<number>
  ) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: interpolate(
            dragX.value,
            [-80, 0],
            [1, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    }));

    return (
      <RectButton style={styles.rightAction} onPress={close}>
        {/* Change it to some icons */}
        <Animated.View style={[styles.actionIcon, animatedStyle]} />
      </RectButton>
    );
  };

  const swipeableRow = useRef<SwipeableMethods>(null);

  const close = () => {
    swipeableRow.current?.close();
  };

  return (
    <Swipeable
      ref={swipeableRow}
      friction={2}
      leftThreshold={80}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
}

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
