---
id: composing-gestures
title: Composing gestures
sidebar_label: Composing gestures
---

Composing gestures is much simpler in RNGH2, you don't need to create a ref for every gesture that depends on another one. Instead you can use `Exclusive`, `Simultaneous` and `RequireToFail` methods provided by the `Gesture` object.

## Exclusive

Is the equivalent to just having more than one gesture handler without defining `simultaneousHandlers` and `waitFor` props. It means that only one of the provided gestures can become active at the same time. It accepts variable number of arguments.

For example, lets say that you have a component that you want to make draggable but you also want to show additional options on long press. Presumably you would not want the component to move after the long press activates. You can accomplish this using `Exclusive`:

```js
const offset = useSharedValue({ x: 0, y: 0 });
const start = useSharedValue({ x: 0, y: 0 });
const popupPosition = useSharedValue({ x: 0, y: 0 });
const popupAlpha = useSharedValue(0);

const animatedStyles = useAnimatedStyle(() => {
  return {
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }],
  };
});

const animatedPopupStyles = useAnimatedStyle(() => {
  return {
    transform: [
      { translateX: popupPosition.value.x },
      { translateY: popupPosition.value.y },
    ],
    opacity: popupAlpha.value,
  };
});

const dragGesture = Gesture.Pan()
  .onStart((_e) => {
    'worklet';
    popupAlpha.value = withTiming(0);
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
  });

const longPressGesture = Gesture.LongPress()
  .onStart((_event) => {
    'worklet';
    popupPosition.value = { x: offset.value.x, y: offset.value.y };
    popupAlpha.value = withTiming(1);
  });

const exclusive = Gesture.Exclusive(dragGesture, longPressGesture);

return (
  <Animated.View>
    <Popup style={animatedPopupStyles} />
    <GestureDetector gesture={exclusive}>
      <Component style={animatedStyles} />
    </GestureDetector>
  </Animated.View>
);
```

## Simultaneous

It accepts 2 arguments and it is the equivalent to having two gesture handlers, each with `simultaneousHandlers` prop set to the other handler.

For example, if you want to make a gallery app, you might want user to be able to zoom, rotate and pan around photos. You can do it with `Simultaneous`:

```js
const offset = useSharedValue({ x: 0, y: 0 });
const start = useSharedValue({ x: 0, y: 0 });
const scale = useSharedValue(1);
const savedScale = useSharedValue(1);
const rotation = useSharedValue(0);
const savedRotation = useSharedValue(0);

const animatedStyles = useAnimatedStyle(() => {
  return {
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  };
});

const dragGesture = Gesture.Pan()
  .averageTouches(true)
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
  });

const zoomGesture = Gesture.Pinch()
  .onUpdate((event) => {
    'worklet';
    scale.value = savedScale.value * event.scale;
  })
  .onEnd(() => {
    'worklet';
    savedScale.value = scale.value;
  });

const rotateGesture = Gesture.Rotation()
  .onUpdate((event) => {
    'worklet';
    rotation.value = savedRotation.value + event.rotation;
  })
  .onEnd(() => {
    'worklet';
    savedRotation.value = rotation.value;
  });

const simultaneous = Gesture.Simultaneous(
  dragGesture,
  Gesture.Simultaneous(zoomGesture, rotateGesture)
);

return (
  <Animated.View>
    <GestureDetector gesture={simultaneous}>
    	<Photo style={animatedStyles} />
    </GestureDetector>
  </Animated.View>
);
```

## RequireToFail

It accepts 2 arguments and it is equivalent to having two gesture handlers where the first one has the `waitFor` prop set to the other handler. We hope that the changed name will be less ambigous than `waitFor`, which could be interpreted both as `wait for other handler to fail` or `wait for other handler to activate`.

For example, if you want to make a component that responds to single tap as well as to a double tap, you can accomplish that using `RequireToFail`:

```js
const singleTap = Gesture.Tap().onEnd((_event, success) => {
  if (success) {
    console.log('single tap!');
  }
});
const doubleTap = Gesture.Tap()
  .numberOfTaps(2)
  .onEnd((_event, success) => {
    if (success) {
      console.log('double tap!');
    }
  });

const taps = Gesture.RequireToFail(singleTap, doubleTap);

return (
  <GestureDetector gesture={taps}>
    <Component />
  </GestureDetector>
);
```
