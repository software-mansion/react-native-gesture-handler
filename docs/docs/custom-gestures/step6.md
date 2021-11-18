```jsx {3-16}
const gesture = Gesture.Custom()
    ...
    .onTouchesUp((e, manager) => {
      'worklet';
      for (const touch of e.touches) {
        trackedPointers[touch.id].value = {
          visible: false,
          x: touch.x,
          y: touch.y,
        };
      }

      if (e.numberOfPointers === 0) {
        manager.end();
      }
    })
```
