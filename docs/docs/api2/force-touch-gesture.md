---
id: force-touch-gesture
title: Force touch gesture (iOS only)
sidebar_label: Force touch gesture
---

A continuous gesture handler that recognizes force of a touch. It allows for tracking pressure of touch on some iOS devices.
The handler [activates](../state.md#active) when pressure of touch if greater or equal than `minForce`. It fails if pressure is greater than `maxForce`
Gesture callback can be used for continuous tracking of the touch pressure. It provides information for one finger (the first one).

At the beginning of the gesture, the pressure factor is 0.0. As the pressure increases, the pressure factor increases proportionally. The maximum pressure is 1.0.

The handler is implemented using custom [UIGestureRecognizer](https://developer.apple.com/documentation/uikit/uigesturerecognizer) on iOS. There's no implementation provided on Android and it simply render children without any wrappers.
Since this behaviour is only provided on some iOS devices, this handler should not be used for defining any crucial behaviors. Use it only as an additional improvement and make all features to be accessed without this handler as well.

## Config

See [set of properties common to all gestures](common-gesture#config). Below is a list of properties specific to `ForceTouchGesture`:

### `minForce(value: number)`

A minimal pressure that is required before handler can [activate](../state.md#active). Should be a value from range `[0.0, 1.0]`. Default is `0.2`.

### `maxForce(value: number)`

A maximal pressure that could be applied for handler. If the pressure is greater, handler [fails](../state.md#failed). Should be a value from range `[0.0, 1.0]`.

### `feedbackOnActivation(value: boolean)`

Value defining if haptic feedback has to be performed on activation.

## Event data

See [set of event attributes common to all gestures](common-gesture#event-data). Below is a list of gesture event attributes specific to `ForceTouchGesture`:

### `force`

The pressure of a touch.
