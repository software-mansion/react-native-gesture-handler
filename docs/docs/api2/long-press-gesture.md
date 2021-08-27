---
id: long-press-gesture
title: Long press gesture
sidebar_label: Long press gesture
---

A discrete gesture that activates when the corresponding view is pressed for a sufficiently long time.
This gesture's state will turn into [END](../state.md#end) immediately after the finger is released.
The gesture will fail to recognize a touch event if the finger is lifted before the [minimum required time](#mindurationms) or if the finger is moved further than the [allowable distance](#maxdist).

The gesture is implemented using [UILongPressGestureRecognizer](https://developer.apple.com/documentation/uikit/uilongpressgesturerecognizer) on iOS and [LongPressGestureHandler](https://github.com/software-mansion/react-native-gesture-handler/blob/master/android/lib/src/main/java/com/swmansion/gesturehandler/LongPressGestureHandler.java) on Android.

## Config

See [set of properties common to all gestures](common-gesture#config). Below is a list of properties specific to `LongPressGesture`:

### `minDurationMs(value: number)`

Minimum time, expressed in milliseconds, that a finger must remain pressed on the corresponding view. The default value is 500.

### `maxDist(value: number)`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel during a long press gesture. If the finger travels further than the defined distance and the gesture hasn't yet [activated](../state.md#active), it will fail to recognize the gesture. The default value is 10.

## Event data

See [set of event attributes common to all gestures](common-gesture#event-data). Below is a list of gesture event attributes specific to `LongPressGesture`:

### `x`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](gesture-detector).

### `y`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](gesture-detector).

### `absoluteX`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. It is recommended to use `absoluteX` instead of [`x`](#x) in cases when the view attached to the [`GestureDetector`](gesture-detector) can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. It is recommended to use `absoluteY` instead of [`y`](#y) in cases when the view attached to the [`GestureDetector`](gesture-detector) can be transformed as an effect of the gesture.

### `duration`

Duration of the long press (time since the start of the event), expressed in milliseconds.
