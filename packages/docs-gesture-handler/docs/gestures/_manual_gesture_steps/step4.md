```tsx
const gesture = useManualGesture({
  onTouchesDown: (e) => {
    for (const touch of e.changedTouches) {
      trackedPointers[touch.id].value = {
        x: touch.x,
        y: touch.y,
        visible: true,
      };
    }

    if (e.numberOfTouches >= 2) {
      GestureStateManager.activate(e.handlerTag);
    }
  },
});
```
