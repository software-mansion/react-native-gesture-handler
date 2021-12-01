---
id: rotation-gesture
title: Rotation gesture
sidebar_label: Rotation gesture
---

import BaseEventData from './base-gesture-event-data.md';
import BaseEventConfig from './base-gesture-config.md';
import BaseContinousEventConfig from './base-continous-gesture-config.md';
import BaseEventCallbacks from './base-gesture-callbacks.md';
import BaseContinousEventCallbacks from './base-continous-gesture-callbacks.md';

A continuous gesture that can recognize a rotation gesture and track its movement.

The gesture [activates](../../under-the-hood/states-events.md#active) when fingers are placed on the screen and change position in a proper way.

Gesture callback can be used for continuous tracking of the rotation gesture. It provides information about the gesture such as the amount rotated, the focal point of the rotation (anchor), and its instantaneous velocity.

## Config

<BaseEventConfig />
<BaseContinousEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinousEventCallbacks />

## Event data

### Event attributes specific to `RotationGesture`:

### `rotation`

Amount rotated, expressed in radians, from the gesture's focal point (anchor).

### `velocity`

Instantaneous velocity, expressed in point units per second, of the gesture.

### `anchorX`

X coordinate, expressed in points, of the gesture's central focal point (anchor).

### `anchorY`

Y coordinate, expressed in points, of the gesture's central focal point (anchor).

<BaseEventData />

## Example

```jsx
const rotation = useSharedValue(1);
const savedRotation = useSharedValue(1);

const rotationGesture = Gesture.Rotation()
  .onUpdate((e) => {
    rotation.value = savedRotation.value + e.rotation;
  })
  .onEnd(() => {
    savedRotation.value = rotation.value;
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ rotateZ: `${(rotation.value / Math.PI) * 180}deg` }],
}));

return (
  <GestureDetector gesture={rotationGesture}>
    <Animated.View style={[styles.box, animatedStyle]} />
  </GestureDetector>
);
```
