/* eslint-disable no-alert */
import React from 'react';
import { Text, Animated, StyleSheet, View, Pressable } from 'react-native';

import {
  Pressable as GHPressable,
  Swipeable,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
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
    <Animated.Text
      style={[
        styles.leftAction,
        {
          transform: [{ translateX: trans }],
        },
      ]}>
      Text
    </Animated.Text>
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
    <Animated.Text
      style={[
        styles.rightAction,
        {
          transform: [{ translateX: trans }],
        },
      ]}>
      Text
    </Animated.Text>
  );
}

export default function Example() {
  return (
    <GestureHandlerRootView>
      <View style={styles.separator} />

      <ReanimatedSwipeable
        containerStyle={styles.swipeable}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={56}
        renderLeftActions={LeftAction}
        renderRightActions={RightAction}>
        <Pressable onPress={() => alert('pressed!')} style={styles.pressable}>
          <Text>[new] with RN pressable</Text>
        </Pressable>
      </ReanimatedSwipeable>

      <View style={styles.separator} />

      <ReanimatedSwipeable
        containerStyle={styles.swipeable}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={56}
        renderLeftActions={LeftAction}
        renderRightActions={RightAction}>
        <GHPressable onPress={() => alert('pressed!')} style={styles.pressable}>
          <Text>[new] with GH pressable</Text>
        </GHPressable>
      </ReanimatedSwipeable>

      <View style={styles.separator} />

      <Swipeable
        containerStyle={styles.swipeable}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={56}
        renderLeftActions={LegacyLeftAction}
        renderRightActions={LegacyRightAction}>
        <Pressable onPress={() => alert('pressed!')} style={styles.pressable}>
          <Text>[Legacy] with RN pressable</Text>
        </Pressable>
      </Swipeable>

      <View style={styles.separator} />

      <Swipeable
        containerStyle={styles.swipeable}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={56}
        renderLeftActions={LegacyLeftAction}
        renderRightActions={LegacyRightAction}>
        <GHPressable onPress={() => alert('pressed!')} style={styles.pressable}>
          <Text>[Legacy] with GH pressable</Text>
        </GHPressable>
      </Swipeable>

      <View style={styles.separator} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  leftAction: { width: 46, height: 56, backgroundColor: 'crimson' },
  rightAction: { width: 46, height: 56, backgroundColor: 'purple' },
  separator: {
    width: '100%',
    borderTopWidth: 1,
  },
  swipeable: {
    height: 56,
    backgroundColor: 'papayawhip',
    alignItems: 'center',
  },
  pressable: {
    padding: 20,
    width: 200,
    height: 56,
    backgroundColor: 'pink',
    alignItems: 'center',
  },
});
