```tsx
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  GestureStateManager,
  useManualGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  useSharedValue,
} from 'react-native-reanimated';

...

export default function Example() {
  const trackedPointers: SharedValue<Pointer>[] = [];
  const active = useSharedValue(false);

  for (let i = 0; i < 12; i++) {
    trackedPointers[i] = useSharedValue<Pointer>({
      x: 0,
      y: 0,
      visible: false,
    });
  }

  const gesture = useManualGesture({});

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={gesture}>
        <Animated.View style={{ flex: 1 }}>
          {trackedPointers.map((pointer, index) => (
            <PointerElement pointer={pointer} active={active} key={index} />
          ))}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  pointer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
    position: 'absolute',
    marginStart: -30,
    marginTop: -30,
  },
});
```
