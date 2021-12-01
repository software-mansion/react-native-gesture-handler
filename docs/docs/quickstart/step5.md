```jsx
const start = useSharedValue({ x: 0, y: 0 });
const gesture = Gesture.Pan()
  .onBegan(() => {
    isPressed.value = true;
  })
  .onUpdate((e) => {
    offset.value = {
      x: e.translationX + start.value.x,
      y: e.translationY + start.value.y,
    };
  })
  .onEnd(() => {
    start.value = {
      x: offset.value.x,
      y: offset.value.y,
    };
    isPressed.value = false;
  });
```

```jsx {3}
...
return (
  <GestureDetector gesture={gesture}>
    <Animated.View style={[styles.ball, animatedStyles]} />
  </GestureDetector>
);
...
```
