---
id: pointer-events
title: Pointer events
sidebar_label: Pointer events
---

### Pointer event attributes:

### `eventType`

Type of the current event - whether the pointer was placed on the screen, moved, lifted or cancelled.

### `pointerData`

An array of objects where every object represents a single pointer. Keep in mind that only the data about pointer that have changed state is passed. For example, if there are 3 fingers placed on the screen and one of them moves, only information about the one that moved will be send.

Remember that events may be batched so you might receive information about more that one pointer in the same event.

:::caution
Don't rely on the order of items in the `pointerData` as it may change during the gesture, instead use the `pointerId` attribute to track individual pointers across events.
:::

### PointerData attributes:

### `pointerId`

A number representing id of the pointer. It may be used to track the pointer between events as the id will not change while it is being tracked.

### `x`

X coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `y`

Y coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.
