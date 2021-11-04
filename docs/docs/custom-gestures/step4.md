```jsx {2-15}
const gesture = Gesture.Custom()
    .onPointerDown((e, manager) => {
      'worklet';
      for (const pointer of e.pointerData) {
        trackedPointers[pointer.pointerId].value = {
          visible: true,
          x: pointer.x,
          y: pointer.y,
        };
      }

      if (e.numberOfPointers >= 2) {
        manager.activate();
      }
    })
```
