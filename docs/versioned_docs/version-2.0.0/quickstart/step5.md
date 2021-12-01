```jsx
const start = useSharedValue({ x: 0, y: 0 });
const gesture = Gesture.Pan()
  .onBegan(() => {
    'worklet';
    isPressed.value = true;
  })
  .onUpdate((e) => {
    'worklet';
    offset.value = {
      x: e.translationX + start.value.x,
      y: e.translationY + start.value.y,
    };
  })
  .onEnd(() => {
    'worklet';
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
  <GestureDetector animatedGesture={gesture}>
    <Animated.View style={[styles.ball, animatedStyles]} />
  </GestureDetector>
);
...
```
