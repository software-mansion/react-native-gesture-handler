```jsx {2-15}
const gesture = Gesture.Manual().onTouchesDown((e, manager) => {
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
});
```
