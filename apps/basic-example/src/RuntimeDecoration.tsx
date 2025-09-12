import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { COLORS } from './colors';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useState } from 'react';

export function RuntimeChecker({
  runGestureOnJS,
}: {
  runGestureOnJS: boolean;
}) {
  const pressed = useSharedValue(false);
  const active = useSharedValue(false);
  const posX = useSharedValue(0);
  const posY = useSharedValue(0);

  const start = useSharedValue({ x: 0, y: 0 });
  const [isUIRuntime, setIsUIRuntime] = useState<boolean | null>(null);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: posX.value },
        { translateY: posY.value },
        { scale: pressed.value ? 1.2 : 1 },
      ],
      backgroundColor: active.value ? COLORS.KINDA_GREEN : COLORS.KINDA_BLUE,
    };
  });

  const gesture = Gesture.Manual()
    .runOnJS(runGestureOnJS)
    .onTouchesDown((e) => {
      if (!pressed.value) {
        pressed.value = true;
        start.value = {
          x: e.allTouches[0].absoluteX,
          y: e.allTouches[0].absoluteY,
        };
      }
      runOnJS(setIsUIRuntime)(_WORKLET ?? false);
    })
    .onTouchesMove((e, state) => {
      const dist = Math.sqrt(
        Math.pow(e.allTouches[0].absoluteX - start.value.x, 2) +
          Math.pow(e.allTouches[0].absoluteY - start.value.y, 2)
      );

      if (active.value) {
        posX.value = e.allTouches[0].absoluteX - start.value.x;
        posY.value = e.allTouches[0].absoluteY - start.value.y;
      } else {
        if (dist > 10) {
          state.activate();
          start.value = {
            x: e.allTouches[0].absoluteX,
            y: e.allTouches[0].absoluteY,
          };
        }
      }
    })
    .onTouchesUp((e, state) => {
      if (e.allTouches.length === e.changedTouches.length) {
        state.end();
      }
    })
    .onStart(() => {
      active.value = true;
    })
    .onFinalize(() => {
      pressed.value = false;
      active.value = false;
    });

  return (
    <View style={styles.container}>
      <Text>
        {isUIRuntime === null
          ? 'Start the gesture to check the runtime'
          : `Running on the ${isUIRuntime ? 'UI' : 'JS'} runtime`}
      </Text>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.box, style, { backgroundColor: COLORS.KINDA_BLUE }]}
        />
      </GestureDetector>
    </View>
  );
}

export default function RuntimeDecorationExample() {
  return (
    <View style={styles.container}>
      <RuntimeChecker runGestureOnJS={false} />
      <View style={styles.separator} />
      <RuntimeChecker runGestureOnJS={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  box: {
    width: 50,
    height: 50,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: 'black',
  },
});
