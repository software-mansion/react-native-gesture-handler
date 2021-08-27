---
id: fling-gesture
title: Fling gesture
sidebar_label: Fling gesture
---

A discrete gesture that activates when the movement is sufficiently long and fast.
Gesture gets [ACTIVE](../state#active) when movement is sufficiently long and it does not take too much time.
When gesture gets activated it will turn into [END](../state#end) state when finger is released.
The gesture will fail to recognize if the finger is lifted before being activated.
The gesture is implemented using [UISwipeGestureRecognizer](https://developer.apple.com/documentation/uikit/uiswipegesturerecognizer) on iOS and from scratch on Android.

## Config

See [set of properties common to all gestures](common-gesture#config). Below is a list of properties specific to `FlingGesture`:

### `direction(value: Directions)`

Expressed allowed direction of movement. It's possible to pass one or many directions in one parameter:

```js
fling.direction(Directions.RIGHT | Directions.LEFT);
```

or

```js
fling.direction(Directions.DOWN);
```

### `numberOfPointers(value: number)`

Determine exact number of points required to handle the fling gesture.

## Event data

See [set of event attributes common to all gestures](common-gesture#event-data). Below is a list of gesture event attributes specific to `FlingGesture`:

### `x`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](gesture-detector). Expressed in point units.

### `y`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](gesture-detector). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.
