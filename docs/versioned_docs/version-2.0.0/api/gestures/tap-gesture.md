---
id: tap-gesture
title: Tap gesture
sidebar_label: Tap gesture
---

import BaseEventData from './base-gesture-event-data.md';
import BaseEventConfig from './base-gesture-config.md';
import BaseEventCallbacks from './base-gesture-callbacks.md';

A discrete gesture that recognizes one or many taps.

Tap gestures detect one or more fingers briefly touching the screen.
The fingers involved in these gestures must not move significantly from their initial touch positions.
The required number of taps and allowed distance from initial position may be configured.
For example, you might configure tap gesture recognizers to detect single taps, double taps, or triple taps.

In order for a gesture to [activate](../../under-the-hood/states-events.md#active), specified gesture requirements such as minPointers, numberOfTaps, maxDist, maxDurationMs, and maxDelayMs (explained below) must be met. Immediately after the gesture [activates](../../under-the-hood/states-events.md#active), it will [end](../../under-the-hood/states-events.md#end).

## Config

### Properties specific to `TapGesture`:

### `minPointers(value: number)`

Minimum number of pointers (fingers) required to be placed before the gesture [activates](../../under-the-hood/states-events.md#active). Should be a positive integer. The default value is 1.

### `maxDuration(value: number)`

Maximum time, expressed in milliseconds, that defines how fast a finger must be released after a touch. The default value is 500.

### `maxDelay(value: number)`

Maximum time, expressed in milliseconds, that can pass before the next tap — if many taps are required. The default value is 500.

### `numberOfTaps(value: number)`

Number of tap gestures required to [activate](../../under-the-hood/states-events.md#active) the gesture. The default value is 1.

### `maxDeltaX(value: number)`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel along the X axis during a tap gesture. If the finger travels further than the defined distance along the X axis and the gesture hasn't yet [activated](../../under-the-hood/states-events.md#active), it will fail to recognize the gesture.

### `maxDeltaY(value: number)`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel along the Y axis during a tap gesture. If the finger travels further than the defined distance along the Y axis and the gesture hasn't yet [activated](../../under-the-hood/states-events.md#active), it will fail to recognize the gesture.

### `maxDistance(value: number)`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel during a tap gesture. If the finger travels further than the defined distance and the gesture hasn't yet [activated](../../under-the-hood/states-events.md#active), it will fail to recognize the gesture.

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />

## Event data

### Event attributes specific to `TapGesture`:

### `x`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md).

### `y`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md).

### `absoluteX`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. It is recommended to use `absoluteX` instead of [`x`](#x) in cases when the view attached to the [`GestureDetector`](./gesture-detector.md) can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. It is recommended to use `absoluteY` instead of [`y`](#y) in cases when the view attached to the [`GestureDetector`](./gesture-detector.md) can be transformed as an effect of the gesture.

<BaseEventData />

## Example

```jsx
const singleTap = Gesture.Tap()
  .maxDurationMs(250)
  .onStart(() => {
    Alert.alert('Single tap!');
  });

const doubleTap = Gesture.Tap()
  .maxDurationMs(250)
  .onStart(() => {
    Alert.alert('Double tap!');
  });

return (
  <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>
    <View style={styles.box} />
  </GestureDetector>
);
```
