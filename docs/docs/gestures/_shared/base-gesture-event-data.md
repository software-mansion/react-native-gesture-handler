### Event attributes common to all gestures:

### `state`

Current [state](/docs/fundamentals/states-events) of the handler. Expressed as one of the constants exported under `State` object by the library.

### `numberOfPointers`

Represents the number of pointers (fingers) currently placed on the screen.

### `pointerType`
Indicates the type of pointer device in use. This value is represented by the `PointerType` enum, which includes the following fields:

- `TOUCH`
- `STYLUS`
- `MOUSE`
- `OTHER`