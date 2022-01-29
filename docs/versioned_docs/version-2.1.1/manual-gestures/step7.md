```jsx {3-10}
const gesture = Gesture.Manual()
  ...
  .onStart(() => {
    active.value = true;
  })
  .onEnd(() => {
    active.value = false;
  });
```
