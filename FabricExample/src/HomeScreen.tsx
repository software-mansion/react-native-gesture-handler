import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

import { isFabric, isHermes } from './utils';
import { COLORS } from './colors';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

declare const performance: {
  now: () => number;
};

interface GestureDetectorDemoProps {
  color: string;
}

export default function HomeScreen() {
  const pressed = useSharedValue(false);
  const active = useSharedValue(false);
  const posX = useSharedValue(0);
  const posY = useSharedValue(0);

  const start = useSharedValue({ x: 0, y: 0 });

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
    .onTouchesDown((e) => {
      if (!pressed.value) {
        pressed.value = true;
        start.value = {
          x: e.allTouches[0].absoluteX,
          y: e.allTouches[0].absoluteY,
        };
      }
      console.log(_WORKLET);
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
          active.value = true;
        }
      }
    })
    .onTouchesUp((e, state) => {
      if (e.allTouches.length === e.changedTouches.length) {
        state.end();
      }
    })
    .onStart(() => {
      console.log('Gesture started');
    })
    .onFinalize(() => {
      console.log('Gesture finalized');
      pressed.value = false;
      active.value = false;
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.box, style, { backgroundColor: COLORS.KINDA_BLUE }]}
        />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  text: {
    marginVertical: 3,
  },
  demo: {
    marginVertical: 3,
    alignItems: 'center',
  },
  box: {
    width: 50,
    height: 50,
  },
});
