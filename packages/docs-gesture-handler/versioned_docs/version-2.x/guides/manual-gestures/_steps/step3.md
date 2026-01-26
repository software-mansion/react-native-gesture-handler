```jsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function Example() {
  const trackedPointers: Animated.SharedValue<Pointer>[] = [];
  const active = useSharedValue(false);

  for (let i = 0; i < 12; i++) {
    trackedPointers[i] =
      useSharedValue <
      Pointer >
      {
        visible: false,
        x: 0,
        y: 0,
      };
  }

  const gesture = Gesture.Manual();

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={{ flex: 1 }}>
        {trackedPointers.map((pointer, index) => (
          <PointerElement pointer={pointer} active={active} key={index} />
        ))}
      </Animated.View>
    </GestureDetector>
  );
}
```
