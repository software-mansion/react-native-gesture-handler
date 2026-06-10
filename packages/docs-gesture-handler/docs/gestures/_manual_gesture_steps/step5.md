```tsx
const gesture = useManualGesture({
  ...
  onTouchesMove: (e) => {
    for (const touch of e.changedTouches) {
      trackedPointers[touch.id].value = {
        x: touch.x,
        y: touch.y,
        visible: true,
      };
    }
  },
});
```
