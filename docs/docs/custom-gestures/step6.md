```jsx {3-16}
const gesture = Gesture.Custom()
    ...
    .onPointerUp((e, manager) => {
      'worklet';
      for (const pointer of e.pointerData) {
        trackedPointers[pointer.pointerId].value = {
          visible: false,
          x: pointer.x,
          y: pointer.y,
        };
      }

      if (e.numberOfPointers === 0) {
        manager.end();
      }
    })
```
