import React, { ReactNode, useRef } from 'react';
import { StyleSheet, Text, View, I18nManager } from 'react-native';

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

interface AppleStyleSwipeableRowProps {
  children?: ReactNode;
}

interface LeftActionsProps {
  dragX: SharedValue<number>;
  swipeableRef: React.RefObject<SwipeableMethods | null>;
}

const LeftAction = ({ dragX, swipeableRef }: LeftActionsProps) => {
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
    <RectButton
      style={styles.leftAction}
      onPress={() => swipeableRef.current!.close()}>
      <Animated.Text style={[styles.archiveText, animatedStyle]}>
        Archive
      </Animated.Text>
    </RectButton>
  );
};

const renderLeftActions = (
  _: any,
  progress: SharedValue<number>,
  swipeableRef: React.RefObject<SwipeableMethods | null>
) => <LeftAction dragX={progress} swipeableRef={swipeableRef} />;

interface RightActionProps {
  text: string;
  color: string;
  x: number;
  progress: SharedValue<number>;
  totalWidth: number;
  swipeableRef: React.RefObject<SwipeableMethods | null>;
}

const RightAction = ({
  text,
  color,
  x,
  progress,
  totalWidth,
  swipeableRef,
}: RightActionProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, -totalWidth], [x, 0]),
      },
    ],
  }));
  const pressHandler = () => {
    swipeableRef.current?.close();
    // eslint-disable-next-line no-alert
    window.alert(text);
  };

  return (
    <Animated.View style={[styles.rightActionView, animatedStyle]}>
      <RectButton
        style={[styles.rightAction, { backgroundColor: color }]}
        onPress={pressHandler}>
        <Text style={styles.actionText}>{text}</Text>
      </RectButton>
    </Animated.View>
  );
};

const renderRightActions = (
  _: any,
  progress: SharedValue<number>,
  swipeableRef: React.RefObject<SwipeableMethods | null>
) => (
  <View style={styles.rightActionsView}>
    <RightAction
      text="More"
      color="#C8C7CD"
      x={192}
      progress={progress}
      totalWidth={192}
      swipeableRef={swipeableRef}
    />
    <RightAction
      text="Flag"
      color="#ffab00"
      x={128}
      progress={progress}
      totalWidth={192}
      swipeableRef={swipeableRef}
    />
    <RightAction
      text="More"
      color="#dd2c00"
      x={64}
      progress={progress}
      totalWidth={192}
      swipeableRef={swipeableRef}
    />
  </View>
);

export default function AppleStyleSwipeableRow({
  children,
}: AppleStyleSwipeableRowProps) {
  const swipeableRow = useRef<SwipeableMethods>(null);

  return (
    <Swipeable
      ref={swipeableRow}
      friction={2}
      enableTrackpadTwoFingerGesture
      leftThreshold={30}
      rightThreshold={40}
      renderLeftActions={(_, progress) =>
        renderLeftActions(_, progress, swipeableRow)
      }
      renderRightActions={(_, progress) =>
        renderRightActions(_, progress, swipeableRow)
      }
      onSwipeableWillOpen={(direction) => {
        console.log(`Opening swipeable from the ${direction}`);
      }}
      onSwipeableWillClose={(direction) => {
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
  archiveText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 20,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
    margin: 'auto',
  },
  rightActionView: {
    flex: 1,
  },
  rightActionsView: {
    width: 192,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
