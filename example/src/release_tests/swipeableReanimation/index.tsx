import React from 'react';
import { Text, Animated, StyleSheet } from 'react-native';

import {
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler';

import { Swipeable } from 'react-native-gesture-handler';
import { default as ReanimatedSwipeable } from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  default as Reanimated,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

function LeftAction(prog: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    console.log('[R] showLeftProgress:', prog.value);
    console.log('[R] appliedTranslation:', drag.value);

    return {
      transform: [{ translateX: drag.value - 50 }],
    };
  });

  return (
    <Reanimated.View style={styleAnimation}>
      <Text style={styles.leftAction}>Text</Text>
    </Reanimated.View>
  );
}

function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    console.log('[R] showRightProgress:', prog.value);
    console.log('[R] appliedTranslation:', drag.value);

    return {
      transform: [{ translateX: drag.value + 50 }],
    };
  });

  return (
    <Reanimated.View style={styleAnimation}>
      <Text style={styles.rightAction}>Text</Text>
    </Reanimated.View>
  );
}

function LegacyLeftAction(prog: any, drag: any) {
  prog.addListener((value: any) => {
    console.log('[L] showLeftProgress:', value.value);
  });
  drag.addListener((value: any) => {
    console.log('[L] appliedTranslation:', value.value);
  });

  const trans = Animated.subtract(drag, 50);

  return (
    <RectButton>
      <Animated.Text
        style={[
          styles.leftAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}>
        Text
      </Animated.Text>
    </RectButton>
  );
}

function LegacyRightAction(prog: any, drag: any) {
  prog.addListener((value: any) => {
    console.log('[L] showRightProgress:', value.value);
  });
  drag.addListener((value: any) => {
    console.log('[L] appliedTranslation:', value.value);
  });

  const trans = Animated.add(drag, 50);

  return (
    <RectButton>
      <Animated.Text
        style={[
          styles.rightAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}>
        Text
      </Animated.Text>
    </RectButton>
  );
}

export default function Example() {
  return (
    <GestureHandlerRootView>
      <ReanimatedSwipeable
        containerStyle={styles.reanimatedContainer}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderLeftActions={LeftAction}
        renderRightActions={RightAction}>
        <Text>[Reanimated] Swipe me!</Text>
      </ReanimatedSwipeable>

      <Swipeable
        containerStyle={styles.legacyContainer}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderLeftActions={LegacyLeftAction}
        renderRightActions={LegacyRightAction}>
        <Text>[Legacy] Swipe me!</Text>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  leftAction: { width: 50, height: 50, backgroundColor: 'crimson' },
  rightAction: { width: 50, height: 50, backgroundColor: 'purple' },
  reanimatedContainer: {
    height: 50,
    backgroundColor: 'papayawhip',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  legacyContainer: {
    height: 50,
    backgroundColor: 'papayawhip',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
});
