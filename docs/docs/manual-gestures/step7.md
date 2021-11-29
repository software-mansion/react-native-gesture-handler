```jsx {3-10}
const gesture = Gesture.Manual()
  ...
  .onStart(() => {
    'worklet';
    active.value = true;
  })
  .onEnd(() => {
    'worklet';
    active.value = false;
  });
```
