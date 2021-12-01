---
id: fling-gesture
title: Fling gesture
sidebar_label: Fling gesture
---

import BaseEventData from './base-gesture-event-data.md';
import BaseEventConfig from './base-gesture-config.md';
import BaseEventCallbacks from './base-gesture-callbacks.md';

A discrete gesture that activates when the movement is sufficiently long and fast.
Gesture gets [ACTIVE](../../under-the-hood/states-events.md#active) when movement is sufficiently long and it does not take too much time.
When gesture gets activated it will turn into [END](../../under-the-hood/states-events.md#end) state when finger is released.
The gesture will fail to recognize if the finger is lifted before being activated.

## Config

### Properties specific to `FlingGesture`:

### `direction(value: Directions)`

Expressed allowed direction of movement. Expected values are exported as constants in the `Directions` object. It's possible to pass one or many directions in one parameter:

```js
fling.direction(Directions.RIGHT | Directions.LEFT);
```

or

```js
fling.direction(Directions.DOWN);
```

### `numberOfPointers(value: number)`

Determine exact number of points required to handle the fling gesture.

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />

## Event data

### Event attributes specific to `FlingGesture`:

### `x`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `y`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

<BaseEventData />

## Example

```jsx
const position = useSharedValue(0);

const flingGesture = Gesture.Fling()
  .direction(Directions.RIGHT)
  .onStart((e) => {
    position.value = withTiming(position.value + 10, { duration: 100 });
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: position.value }],
}));

return (
  <GestureDetector gesture={flingGesture}>
    <Animated.View style={[styles.box, animatedStyle]} />
  </GestureDetector>
);
```
