---
id: pinch-gesture
title: Pinch gesture
sidebar_label: Pinch gesture
---

A continuous gesture that recognizes pinch gesture. It allows for tracking the distance between two fingers and use that information to scale or zoom your content.
The gesture [activates](../state.md#active) when fingers are placed on the screen and change their position.
Gesture callback can be used for continuous tracking of the pinch gesture. It provides information about velocity, anchor (focal) point of gesture and scale.

The distance between the fingers is reported as a scale factor. At the beginning of the gesture, the scale factor is 1.0. As the distance between the two fingers increases, the scale factor increases proportionally.
Similarly, the scale factor decreases as the distance between the fingers decreases.
Pinch gestures are used most commonly to change the size of objects or content onscreen.
For example, map views use pinch gestures to change the zoom level of the map.

The gesture is implemented using [UIPinchGestureRecognizer](https://developer.apple.com/documentation/uikit/uipinchgesturerecognizer) on iOS and from scratch on Android.

## Config

Pinch gesture does not extend the [common gesture config](./common-gesture.md).

## Event data

See [set of event attributes common to all gestures](./common-gesture.md#event-data). Below is a list of gesture event attributes specific to `PinchGesture`:

### `scale`

The scale factor relative to the points of the two touches in screen coordinates.

### `velocity`

Velocity of the pan gesture the current moment. The value is expressed in point units per second.

### `focalX`

Position expressed in points along X axis of center anchor point of gesture

### `focalY`

Position expressed in points along Y axis of center anchor point of gesture
