```jsx {3-12}
const gesture = Gesture.Custom()
    ...
    .onTouchesMove((e, _manager) => {
      'worklet';
      for (const touch of touches) {
        trackedPointers[touch.id].value = {
          visible: true,
          x: touch.x,
          y: touch.y,
        };
      }
    })
```
