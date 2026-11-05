At any given time, each handler instance has an assigned [state](/docs/under-the-hood/state) that can change when new touch events occur or can be forced to change by the touch system under certain circumstances. You can hook into state transitions using specific [gesture callbacks](#callbacks).

When Reanimated is installed, all callbacks are automatically workletized. For more details, refer to the [Integration with Reanimated](/docs/fundamentals/reanimated-interactions#automatic-workletization-of-gesture-callbacks) section.

## Callbacks flow

### GestureEvent callbacks

Drag or hold the circle below to see how the callback chain reacts.

Note that some of these callbacks are complementary:

* if `onBegin` was called, it is guaranteed that `onFinalize` will be called later.
* if `onActivate` was called, it is guaranteed that `onDeactivate` will be called later.

### TouchEvent callbacks

Low-level `TouchEvent` callbacks are tied to raw pointer activity. Drag out of the card to cancel, or release inside it to see how the callback chain reacts.

## Callbacks

The signatures below use the [`Pan`](/docs/gestures/use-pan-gesture) gesture as an example. Other gestures export analogous types, for example `TapGestureBeginEvent` for the [`onBegin`](#onbegin) callback of the [`Tap`](/docs/gestures/use-tap-gesture) gesture. See [Gesture events](#gesture-events).

### onBegin

```ts
onBegin: (event: PanGestureBeginEvent) => void
```

Called when a handler begins to recognize gestures. If `onBegin` was called, it is guaranteed that `onFinalize` will be called later.

### onActivate

```ts
onActivate: (event: PanGestureActiveEvent) => void
```

Called when activation criteria for the handler are met. If `onActivate` was called, it is guaranteed that `onDeactivate` will be called later.

### onUpdate

```ts
onUpdate: (event: PanGestureActiveEvent) => void
```

Called each time a pointer tracked by the gesture changes state, typically due to movement, after the gesture has been activated.

### onDeactivate

```ts
onDeactivate: (event: PanGestureDeactivateEvent) => void
```

Called when handler stops recognizing gestures, but only if the handler activated. It is called before `onFinalize`. The event object contains a `canceled` property — if the gesture was interrupted, `canceled` is set to `true`. Otherwise it is set to `false`.

### onFinalize

```ts
onFinalize: (event: PanGestureFinalizeEvent) => void
```

Called when handler stops recognizing gestures. The event object contains a `canceled` property — if the handler failed to activate or was interrupted, `canceled` is set to `true`. If the handler managed to activate and completed successfully, `canceled` is set to `false` and `onFinalize` will be called right after `onDeactivate`.

### onTouchesDown

```ts
onTouchesDown: (event: GestureTouchEvent) => void
```

Called when new pointers are placed on the screen. It may carry information about more than one pointer because the events are batched.

### onTouchesMove

```ts
onTouchesMove: (event: GestureTouchEvent) => void
```

Called when pointers are moved on the screen. It may carry information about more than one pointer because the events are batched.

### onTouchesUp

```ts
onTouchesUp: (event: GestureTouchEvent) => void
```

Called when pointers are lifted from the screen. It may carry information about more than one pointer because the events are batched.

### onTouchesCancel

```ts
onTouchesCancel: (event: GestureTouchEvent) => void
```

Called when there will be no more information about this pointer. It may be called because the gesture has ended or was interrupted. It may carry information about more than one pointer because the events are batched.

## Events

### Gesture events

Each gesture exports one event type per callback. For example, the [`Pan`](/docs/gestures/use-pan-gesture) gesture exports `PanGestureBeginEvent`, `PanGestureActiveEvent`, `PanGestureDeactivateEvent` and `PanGestureFinalizeEvent`. Other gestures follow the same pattern, such as `TapGestureBeginEvent` for [`Tap`](/docs/gestures/use-tap-gesture). [`onUpdate`](#onupdate) receives the same event type as [`onActivate`](#onactivate).

All of them share the shape below, shown for `PanGestureBeginEvent`, along with the gesture-specific data listed on each gesture's page:

[`onBegin`](#onbegin) and [`onFinalize`](#onfinalize) receive only the data available before the gesture activates. [`onActivate`](#onactivate), [`onUpdate`](#onupdate) and [`onDeactivate`](#ondeactivate) additionally carry the data computed while the gesture is active, such as [`translationX`](/docs/gestures/use-pan-gesture#translationx) of [`Pan`](/docs/gestures/use-pan-gesture) or [`scale`](/docs/gestures/use-pinch-gesture#scale) of [`Pinch`](/docs/gestures/use-pinch-gesture).

Events passed to [`onDeactivate`](#ondeactivate) and [`onFinalize`](#onfinalize) also contain a `canceled` property. When `canceled` is `true`, the gesture was interrupted or failed to activate.

### TouchEvent

`TouchEvent` carries information about raw touch events, like touching the screen or moving the finger.

* `eventType` - Type of the current event - whether the finger was placed on the screen, moved, lifted or cancelled.

* `changedTouches` - An array of objects where every object represents a single touch. Contains information only about the touches that were affected by the event i.e. those that were placed down, moved, lifted or cancelled.

* `allTouches` - An array of objects where every object represents a single touch. Contains information about all active touches.

* `numberOfTouches` - Number representing the count of currently active touches.

`TouchData` contains information about a single touch.

* `id` - A number representing the id of the touch. It may be used to track the touch between events as the id will not change while it is being tracked.

* `x` - X coordinate of the current position of the touch relative to the view attached to the [`GestureDetector`](/docs/core-components/gesture-detectors#gesture-detector). Expressed in point units.

* `y` - Y coordinate of the current position of the touch relative to the view attached to the [`GestureDetector`](/docs/core-components/gesture-detectors#gesture-detector). Expressed in point units.

* `absoluteX` - X coordinate of the current position of the touch relative to the window. The value is expressed in point units. It is recommended to use it instead of `x` in cases when the original view can be transformed as an effect of the gesture.

* `absoluteY` - Y coordinate of the current position of the touch relative to the window. The value is expressed in point units. It is recommended to use it instead of `y` in cases when the original view can be transformed as an effect of the gesture.

> **Danger**
>
> Don't rely on the order of items in the `changedTouches`/`allTouches` arrays as it may change during the gesture, instead use the `id` attribute to track individual touches across events.
