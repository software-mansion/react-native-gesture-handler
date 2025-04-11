```jsx {3-12}
const gesture = Gesture.Manual()
    ...
    .onTouchesMove((e, _manager) => {
      for (const touch of e.changedTouches) {
        trackedPointers[touch.id].value = {
          visible: true,
          x: touch.x,
          y: touch.y,
        };
      }
    })
```
