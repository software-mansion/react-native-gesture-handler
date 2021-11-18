import React from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureTouchEvent,
  GestureStateManager,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export default function Example() {
  const state = useSharedValue(0);
  const active = useSharedValue(false);

  const touchEnd = (e: GestureTouchEvent, manager: GestureStateManager) => {
    'worklet';
    if (e.touches.find((e) => e.id === 0)) {
      if (e.state === 4) {
        manager.end();
      } else {
        manager.fail();
      }
    }
  };

  const gesture = Gesture.Custom()
    .onTouchesDown((e, manager) => {
      'worklet';
      if (e.touches.find((e) => e.id === 0) !== undefined) {
        state.value = 0;
        manager.begin();
      }
    })
    .onTouchesUp(touchEnd)
    .onTouchesCancelled(touchEnd)
    .onTouchesMove((e, manager) => {
      'worklet';
      if (e.state === 4) {
        return;
      }
      const pointer = e.touches.find((e) => e.id === 0)!;
      switch (state.value) {
        case 0:
          if (pointer?.x > 50 || pointer.y > 300) {
            manager.fail();
          } else if (pointer.y > 250) {
            state.value++;
          }
          break;
        case 1:
          if (pointer.x > 300 || pointer.y > 300 || pointer.y < 250) {
            manager.fail();
          } else if (pointer.x > 250) {
            state.value++;
          }
          break;
        case 2:
          if (pointer.x > 300 || pointer.x < 250 || pointer.y > 300) {
            manager.fail();
          } else {
            if (pointer.y < 50) {
              state.value++;
            }
          }
          break;
        case 3:
          if (pointer.x > 300 || pointer.y > 50) {
            manager.fail();
          } else if (pointer.x < 50) {
            manager.activate();
          }
          break;
      }
    })
    .onBegan(() => {
      'worklet';
      console.log('begin');
    })
    .onStart(() => {
      'worklet';
      active.value = true;
      console.log('active');
    })
    .onEnd(() => {
      'worklet';
      active.value = false;
      console.log('end');
    });

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: active.value ? 'red' : 'transparent',
  }));

  return (
    <GestureDetector animatedGesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View style={styles.square} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  square: {
    margin: 50,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
});
