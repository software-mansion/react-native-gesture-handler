---
id: quickstart
title: Quick start
sidebar_label: Quick start
---

RNGH2 provides much simpler way to add gestures to your app. All you need to do is wrap the view that you want your gesture to work on with [`GestureDetector`](./gesture-detector.md), define the gesture and pass it to detector. That's all!

To demonstrate how you would use the new API, let's make a simple app where you can drag a ball around. You will need to add `react-native-gesture-handler` (for gestures) and `react-native-reanimated` (for animations) modules.

First let's define styles we will ned to make the app:

```js
const styles = StyleSheet.create({
  ball: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
});
```

Then we can start writing our `Ball` component:

```js
function Ball() {
  return (
    <GestureDetector>
      <Animated.View style={[styles.ball]} />
    </GestureDetector>
  );
}
```

Then we need to create animated styles in order to be able to position the ball:

```js
const isPressed = useSharedValue(false);
const offset = useSharedValue({ x: 0, y: 0 });

const animatedStyles = useAnimatedStyle(() => {
  return {
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: withSpring(isPressed.value ? 1.2 : 1) },
    ],
    backgroundColor: isPressed.value ? 'yellow' : 'blue',
  };
});
```

And add it to the ball's styles:

```js
<Animated.View style={[styles.ball, animatedStyles]} />
```

The only thing left is to define the pan gesture and assign it to the detector:

```js
const start = useSharedValue({ x: 0, y: 0 });
const gesture = Gesture.Pan()
  .onBegin(() => {
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

```js
<GestureDetector animatedGesture={gesture}>
```

Note the `start` shared value. We need it to store the position of the ball at the moment we grab it to be able to correctly position it later, because we only have access to translation relative to the starting point of the gesture.

Now you can just add `Ball` component to some view in the app and see the results! (Or you can just check the code [here](https://github.com/software-mansion/react-native-gesture-handler/blob/new-api/examples/Example/src/new_api/reanimated/index.tsx) and see it in action in the Example app.)
