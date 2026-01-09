```tsx
const gesture = useManualGesture({
  ...
  onTouchesUp: (e) => {
    for (const touch of e.changedTouches) {
      trackedPointers[touch.id].value = {
        x: touch.x,
        y: touch.y,
        visible: false,
      };
    }

    if (e.numberOfTouches === 0) {
      GestureStateManager.deactivate(e.handlerTag);
    }
  },
});
```
