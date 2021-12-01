---
id: rotation-gesture
title: Rotation gesture
sidebar_label: Rotation gesture
---

A continuous gesture that can recognize a rotation gesture and track its movement.

The gesture [activates](./state.md#active) when fingers are placed on the screen and change position in a proper way.

Gesture callback can be used for continuous tracking of the rotation gesture. It provides information about the gesture such as the amount rotated, the focal point of the rotation (anchor), and its instantaneous velocity.

The gesture is implemented using [UIRotationGestureRecognizer](https://developer.apple.com/documentation/uikit/uirotationgesturerecognizer) on iOS and from scratch on Android.

## Config

Rotation gesture does not extend the [common gesture config](./common-gesture.md).

## Event data

See [set of event attributes common to all gestures](./common-gesture.md#event-data). Below is a list of gesture event attributes specific to `RotationGesture`:

### `rotation`

Amount rotated, expressed in radians, from the gesture's focal point (anchor).

### `velocity`

Instantaneous velocity, expressed in point units per second, of the gesture.

### `anchorX`

X coordinate, expressed in points, of the gesture's central focal point (anchor).

### `anchorY`

Y coordinate, expressed in points, of the gesture's central focal point (anchor).
