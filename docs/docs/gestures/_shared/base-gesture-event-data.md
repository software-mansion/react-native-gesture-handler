### Event attributes common to all gestures:

### `state`

Current [state](/docs/fundamentals/states-events) of the handler. Expressed as one of the constants exported under `State` object by the library.

### `numberOfPointers`

Represents the number of pointers (fingers) currently placed on the screen.

### `pointerType`
Indicates the type of pointer device being used. This value is represented by one of the constants defined in the `PointerType` enum, which includes the following fields:

- `TOUCH`
- `STYLUS`
- `MOUSE`
- `OTHER`