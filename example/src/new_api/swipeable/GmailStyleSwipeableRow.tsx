import React, { ReactNode, useRef } from 'react';
import { StyleSheet, I18nManager } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Swipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

interface LeftActionProps {
  dragX: SharedValue<number>;
  swipeableRef: React.RefObject<SwipeableMethods | null>;
}
const LeftAction = ({ dragX, swipeableRef }: LeftActionProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(dragX.value, [0, 80], [0, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <RectButton
      style={styles.leftAction}
      onPress={() => swipeableRef.current!.close()}>
      {/* Change it to some icons */}
      <Animated.View style={[styles.actionIcon, animatedStyle]} />
    </RectButton>
  );
};

const renderLeftActions = (
  _: any,
  progress: SharedValue<number>,
  swipeableRef: React.RefObject<SwipeableMethods | null>
) => <LeftAction dragX={progress} swipeableRef={swipeableRef} />;

interface RightActionProps {
  dragX: SharedValue<number>;
  swipeableRef: React.RefObject<SwipeableMethods | null>;
}
const RightAction = ({ dragX, swipeableRef }: RightActionProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(dragX.value, [-80, 0], [1, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <RectButton
      style={styles.rightAction}
      onPress={() => swipeableRef.current!.close()}>
      {/* Change it to some icons */}
      <Animated.View style={[styles.actionIcon, animatedStyle]} />
    </RectButton>
  );
};

const renderRightActions = (
  _: any,
  progress: SharedValue<number>,
  swipeableRef: React.RefObject<SwipeableMethods | null>
) => <RightAction dragX={progress} swipeableRef={swipeableRef} />;
interface GmailStyleSwipeableRowProps {
  children?: ReactNode;
}

export default function GmailStyleSwipeableRow({
  children,
}: GmailStyleSwipeableRowProps) {
  const swipeableRow = useRef<SwipeableMethods>(null);
  return (
    <Swipeable
      ref={swipeableRow}
      friction={2}
      leftThreshold={80}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderLeftActions={(_, progress) =>
        renderLeftActions(_, progress, swipeableRow)
      }
      renderRightActions={(_, progress) =>
        renderRightActions(_, progress, swipeableRow)
      }>
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
