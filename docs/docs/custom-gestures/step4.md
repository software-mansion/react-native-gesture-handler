```jsx {2-15}
const gesture = Gesture.Custom()
    .onTouchesDown((e, manager) => {
      'worklet';
      for (const touch of e.touchesData) {
        trackedPointers[touch.touchId].value = {
          visible: true,
          x: touch.x,
          y: touch.y,
        };
      }

      if (e.numberOfPointers >= 2) {
        manager.activate();
      }
    })
```
