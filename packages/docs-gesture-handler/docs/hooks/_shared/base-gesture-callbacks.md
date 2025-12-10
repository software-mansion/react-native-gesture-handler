### Callbacks common to all gestures:

### onBegin

```ts
onBegin: (event: HandlerData) => void
```

Set the callback that is being called when given gesture handler starts receiving touches. At the moment of this callback the handler is not yet in an active state and we don't know yet if it will recognize the gesture at all.

### onActivate

```ts
onActivate: (event: HandlerData) => void
```

Set the callback that is being called when the gesture is recognized by the handler and it transitions to the active state.

### onDeactivate

```ts
onDeactivate: (event: HandlerData) => void
```

Set the callback that is being called when the gesture that was recognized by the handler finishes. It will be called only if the handler was previously in the active state.

### onFinalize

```ts
onFinalize: (event: HandlerData) => void
```

Set the callback that is being called when the handler finalizes handling gesture - the gesture was recognized and has finished or it failed to recognize.

### onTouchesDown

```ts
onTouchesDown: (event: GestureTouchEvent) => void
```

Set the `onTouchesDown` callback which is called every time a finger is placed on the screen.

### onTouchesMove

```ts
onTouchesMove: (event: GestureTouchEvent) => void
```

Set the `onTouchesMove` callback which is called every time a finger is moved on the screen.

### onTouchesUp

```ts
onTouchesUp: (event: GestureTouchEvent) => void
```

Set the `onTouchesUp` callback which is called every time a finger is lifted from the screen.

### onTouchesCancel

```ts
onTouchesCancel: (event: GestureTouchEvent) => void
```

Set the `onTouchesCancel` callback which is called every time a finger stops being tracked, for example when the gesture finishes.
