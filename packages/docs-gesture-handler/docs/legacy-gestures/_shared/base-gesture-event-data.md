### Event attributes common to all gestures:

### `state`

Current [state](/docs/2.x/fundamentals/states-events) of the handler. Expressed as one of the constants exported under `State` object by the library.

### `numberOfPointers`

Represents the number of pointers (fingers) currently placed on the screen.

### `pointerType`

Indicates the type of pointer device in use. This value is represented by the `PointerType` enum, which includes the following fields:

- `TOUCH` - represents finger
- `STYLUS` - represents stylus or digital pen
- `MOUSE` - represents computer mouse
- `KEY` - represents keyboard
- `OTHER` - represents unknown device type that is not relevant
