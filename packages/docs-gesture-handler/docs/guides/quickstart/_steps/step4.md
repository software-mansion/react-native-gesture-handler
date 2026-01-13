```jsx
import { usePanGesture } from 'react-native-gesture-handler';

function Ball() {
  // ...
  const start = useSharedValue({ x: 0, y: 0 });

  const gesture = usePanGesture({
    onBegin: () => {
      isPressed.value = true;
    },
    onUpdate: (e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    },
    onDeactivate: () => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    },
    onFinalize: () => {
      isPressed.value = false;
    },
  });
  // ...
}
```
