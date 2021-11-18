```jsx {2-15}
const gesture = Gesture.Custom().onTouchesDown((e, manager) => {
  'worklet';
  for (const touch of e.touches) {
    trackedPointers[touch.id].value = {
      visible: true,
      x: touch.x,
      y: touch.y,
    };
  }

  if (e.numberOfPointers >= 2) {
    manager.activate();
  }
});
```
