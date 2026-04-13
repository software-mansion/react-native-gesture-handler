A plain gesture that has no specific activation criteria nor event data set. Its state has to be controlled manually using a [state manager](/docs/2.x/gestures/state-manager). It will not fail when all the pointers are lifted from the screen.

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const manual = Gesture.Manual();

  return (
    <GestureDetector gesture={manual}>
      <Animated.View />
    </GestureDetector>
  );
}
```

## Config

## Callbacks

## Event data
