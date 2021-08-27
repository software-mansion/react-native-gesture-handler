---
id: tap-gesture
title: Tap gesture
sidebar_label: Tap gesture
---

A discrete gesture that recognizes one or many taps.

Tap gestures detect one or more fingers briefly touching the screen.
The fingers involved in these gestures must not move significantly from their initial touch positions.
The required number of taps and allowed distance from initial position may be configured.
For example, you might configure tap gesture recognizers to detect single taps, double taps, or triple taps.

In order for a gesture to [activate](../state.md#active), specified gesture requirements such as minPointers, numberOfTaps, maxDist, maxDurationMs, and maxDelayMs (explained below) must be met. Immediately after the gesture [activates](../state.md#active), it will [END](../state.md#end).

## Config

See [set of properties common to all gestures](common-gesture#config). Below is a list of properties specific to `TapGesture`:

### `minPointers(value: number)`

Minimum number of pointers (fingers) required to be placed before the gesture [activates](../state.md#active). Should be a positive integer. The default value is 1.

### `maxDurationMs(value: number)`

Maximum time, expressed in milliseconds, that defines how fast a finger must be released after a touch. The default value is 500.

### `maxDelayMs(value: number)`

Maximum time, expressed in milliseconds, that can pass before the next tap — if many taps are required. The default value is 500.

### `numberOfTaps(value: number)`

Number of tap gestures required to [activate](../state.md#active) the gesture. The default value is 1.

### `maxDeltaX(value: number)`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel along the X axis during a tap gesture. If the finger travels further than the defined distance along the X axis and the gesture hasn't yet [activated](../state.md#active), it will fail to recognize the gesture.

### `maxDeltaY(value: number)`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel along the Y axis during a tap gesture. If the finger travels further than the defined distance along the Y axis and the gesture hasn't yet [activated](../state.md#active), it will fail to recognize the gesture.

### `maxDist(value: number)`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel during a tap gesture. If the finger travels further than the defined distance and the gesture hasn't yet [activated](../state.md#active), it will fail to recognize the gesture.

## Event data

See [set of event attributes common to all gestures](common-gesture#event-data). Below is a list of gesture event attributes specific to `TapGesture`:

### `x`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](gesture-detector).

### `y`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](gesture-detector).

### `absoluteX`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. It is recommended to use `absoluteX` instead of [`x`](#x) in cases when the view attached to the [`GestureDetector`](gesture-detector) can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. It is recommended to use `absoluteY` instead of [`y`](#y) in cases when the view attached to the [`GestureDetector`](gesture-detector) can be transformed as an effect of the gesture.
