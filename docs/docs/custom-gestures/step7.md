```jsx {3-10}
const gesture = Gesture.Custom()
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
