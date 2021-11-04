```jsx {3-12}
const gesture = Gesture.Custom()
    ...
    .onPointerMove((e, _manager) => {
      'worklet';
      for (const pointer of e.pointerData) {
        trackedPointers[pointer.pointerId].value = {
          visible: true,
          x: pointer.x,
          y: pointer.y,
        };
      }
    })
```
