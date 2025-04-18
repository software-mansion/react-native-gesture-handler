import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface Pointer {
  visible: boolean;
  x: number;
  y: number;
}

function PointerElement(props: {
  pointer: Animated.SharedValue<Pointer>;
  active: Animated.SharedValue<boolean>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: props.pointer.value.x },
      { translateY: props.pointer.value.y },
      {
        scale:
          (props.pointer.value.visible ? 1 : 0) *
          (props.active.value ? 1.3 : 1),
      },
    ],
    backgroundColor: props.active.value ? 'red' : 'blue',
  }));

  return <Animated.View style={[styles.pointer, animatedStyle]} />;
}

export default function Example() {
  const trackedPointers: Animated.SharedValue<Pointer>[] = [];
  const active = useSharedValue(false);

  for (let i = 0; i < 12; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    trackedPointers[i] = useSharedValue<Pointer>({
      visible: false,
      x: 0,
      y: 0,
    });
  }

  const gesture = Gesture.Manual()
    .onTouchesDown((e, manager) => {
      for (const touch of e.changedTouches) {
        trackedPointers[touch.id].value = {
          visible: true,
          x: touch.x,
          y: touch.y,
        };
      }

      if (e.numberOfTouches >= 2) {
        manager.activate();
      }
    })
    .onTouchesMove((e, _manager) => {
      for (const touch of e.changedTouches) {
        trackedPointers[touch.id].value = {
          visible: true,
          x: touch.x,
          y: touch.y,
        };
      }
    })
    .onTouchesUp((e, manager) => {
      for (const touch of e.changedTouches) {
        trackedPointers[touch.id].value = {
          visible: false,
          x: touch.x,
          y: touch.y,
        };
      }

      if (e.numberOfTouches === 0) {
        manager.end();
      }
    })
    .onTouchesCancelled((e, manager) => {
      for (const touch of e.allTouches) {
        trackedPointers[touch.id].value = {
          visible: false,
          x: touch.x,
          y: touch.y,
        };
      }

      manager.fail();
    })
    .onStart(() => {
      active.value = true;
    })
    .onEnd(() => {
      active.value = false;
    });
  return (
    <View style={styles.home}>
      <Text style={styles.title}>
        A simple one that tracks all pointers on the screen, Trigger method:
      </Text>
      <Text style={styles.desc}>
        - Emulator: option + tap (iOS) or command + tap (Android)
      </Text>
      <Text style={styles.desc}>- Device: multiple finger taps</Text>
      <GestureDetector gesture={gesture}>
        <Animated.View style={{ flex: 1 }}>
          {trackedPointers.map((pointer, index) => (
            <PointerElement pointer={pointer} active={active} key={index} />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  home: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  pointer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
    position: 'absolute',
    marginStart: -30,
    marginTop: -30,
  },

  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  desc: {
    marginVertical: 3,
    marginHorizontal: 10,
    fontSize: 16,
  },
});
