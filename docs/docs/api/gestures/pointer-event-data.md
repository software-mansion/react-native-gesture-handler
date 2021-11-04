### Pointer event attributes:

### `eventType`

Type of the current event - whether the pointer was placed on the screen, moved, lifted or cancelled.

### `pointerData`

An array of objects where every object represents a single pointer.

#### `pointerData.pointerId`

A number representing id of the pointer. It may be used to track the pointer between events as the id will not change while it is being tracked.

#### `pointerData.x`

X coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

#### `pointerData.y`

Y coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

#### `pointerData.absoluteX`

X coordinate of the current position of the pointer relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

#### `pointerData.absoluteY`

Y coordinate of the current position of the pointer relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.
