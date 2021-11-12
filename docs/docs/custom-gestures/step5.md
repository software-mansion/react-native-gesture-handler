```jsx {3-12}
const gesture = Gesture.Custom()
    ...
    .onTouchesMove((e, _manager) => {
      'worklet';
      for (const touch of touchesData) {
        trackedPointers[touch.ptouchId].value = {
          visible: true,
          x: touch.x,
          y: touch.y,
        };
      }
    })
```
