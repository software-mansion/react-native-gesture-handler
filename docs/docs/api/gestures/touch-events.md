---
id: touch-events
title: Touch events
sidebar_label: Touch events
---

### Touch event attributes:

### `eventType`

Type of the current event - whether the finger was placed on the screen, moved, lifted or cancelled.

### `touches`

An array of objects where every object represents a single touch. Keep in mind that only the data about touches that have changed state is passed. For example, if there are 3 fingers placed on the screen and one of them moves, only information about the one that moved will be send.

Remember that events may be batched so you might receive information about more that one touch in the same event.

:::caution
Don't rely on the order of items in the `touches` as it may change during the gesture, instead use the `id` attribute to track individual touches across events.
:::

### PointerData attributes:

### `id`

A number representing id of the touch. It may be used to track the touch between events as the id will not change while it is being tracked.

### `x`

X coordinate of the current position of the touch relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `y`

Y coordinate of the current position of the touch relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the touch relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the touch relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.
