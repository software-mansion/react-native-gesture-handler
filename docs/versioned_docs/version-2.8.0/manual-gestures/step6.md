```jsx {3-16}
const gesture = Gesture.Manual()
    ...
    .onTouchesUp((e, manager) => {
      for (const touch of e.changedTouches) {
        trackedPointers[touch.id].value = {
          visible: false,
          x: touch.x,
          y: touch.y,
        };
      }

      if (e.numberOfTouches === 0) {
        manager.end();
      }
    })
```
