---
id: touch-events
title: Touch events
sidebar_label: Touch events
sidebar_position: 14
---

### Touch event attributes:

### `eventType`

Type of the current event - whether the finger was placed on the screen, moved, lifted or cancelled.

### `changedTouches`

An array of objects where every object represents a single touch. Contains information only about the touches that were affected by the event i.e. those that were placed down, moved, lifted or cancelled.

### `allTouches`

An array of objects where every object represents a single touch. Contains information about all active touches.

### `numberOfTouches`

Number representing the count of currently active touches.

:::caution
Don't rely on the order of items in the `touches` as it may change during the gesture, instead use the `id` attribute to track individual touches across events.
:::

### PointerData attributes:

### `id`

A number representing id of the touch. It may be used to track the touch between events as the id will not change while it is being tracked.

### `x`

X coordinate of the current position of the touch relative to the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector). Expressed in point units.

### `y`

Y coordinate of the current position of the touch relative to the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the touch relative to the window. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the touch relative to the window. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.
