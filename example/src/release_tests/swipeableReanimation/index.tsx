import React, { useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import {
  GestureHandlerRootView,
  Pressable,
} from 'react-native-gesture-handler';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
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

export default function Example() {
  const reanimatedRef = useRef<SwipeableMethods>(null);

  return (
    <GestureHandlerRootView>
      <View style={styles.separator} />

      <View style={styles.controlPanelWrapper}>
        <Text>Programatical controls</Text>
        <View style={styles.controlPanel}>
          <Pressable
            style={styles.control}
            onPress={() => {
              reanimatedRef.current!.openLeft();
            }}>
            <Text>open left</Text>
          </Pressable>
          <Pressable
            style={styles.control}
            onPress={() => {
              reanimatedRef.current!.close();
            }}>
            <Text>close</Text>
          </Pressable>
          <Pressable
            style={styles.control}
            onPress={() => {
              reanimatedRef.current!.reset();
            }}>
            <Text>reset</Text>
          </Pressable>
          <Pressable
            style={styles.control}
            onPress={() => {
              reanimatedRef.current!.openRight();
            }}>
            <Text>open right</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.separator} />

      <ReanimatedSwipeable
        ref={reanimatedRef}
        containerStyle={styles.swipeable}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderLeftActions={LeftAction}
        renderRightActions={RightAction}>
        <Text>[Reanimated] Swipe me!</Text>
      </ReanimatedSwipeable>

      <View style={styles.separator} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  leftAction: { width: 50, height: 50, backgroundColor: 'crimson' },
  rightAction: { width: 50, height: 50, backgroundColor: 'purple' },
  separator: {
    width: '100%',
    borderTopWidth: 1,
  },
  swipeable: {
    height: 50,
    backgroundColor: 'papayawhip',
    alignItems: 'center',
  },
  controlPanelWrapper: {
    backgroundColor: 'papayawhip',
    alignItems: 'center',
  },
  controlPanel: {
    backgroundColor: 'papayawhip',
    alignItems: 'center',
    flexDirection: 'row',
  },
  control: {
    flex: 1,
    height: 40,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
