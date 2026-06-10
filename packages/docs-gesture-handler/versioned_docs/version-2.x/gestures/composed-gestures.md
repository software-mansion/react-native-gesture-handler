---
id: composed-gestures
title: Composed gestures
sidebar_label: Composed gestures
sidebar_position: 13
---

Composed gestures (`Race`, `Simultaneous`, `Exclusive`) provide a simple way of building relations between gestures. See [Gesture Composition](/docs/2.x/fundamentals/gesture-composition) for more details.

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  const pan = Gesture.Pan();
  const longPress = Gesture.LongPress();

  // highlight-next-line
  const composed = Gesture.Race(pan, longPress);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View />
    </GestureDetector>
  );
}
```
