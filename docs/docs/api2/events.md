---
id: events
title: Events
sidebar_label: Events
---

There are two types of events in RNGH2: `StateChangeEvent` and `GestureEvent`. The `StateChangeEvent` is send every time a gesture moves to a different state, while `GestureEvent` is send every time a gesture is updated. Both carry a gesture-specific data and a `state` property, indicating the current state of the gesture. `StateChangeEvent` also carries a `oldState` property indicating the previous state of the gesture.

## Callbacks

### `onBegan(event)`

Is called when a gesture transitions to the [`BEGAN`](../state.md#began) state.

### `onStart(event)`

Is called when a gesture transitions to the [`ACTIVE`](../state.md#active) state.

### `onEnd(event, success)`

Is called when a gesture transitions to the [`END`](../state.md#end), [`FAILED`](../state.md#failed), or [`CANCELLED`](../state.md#cancelled) state. If the gesture transitions to the [`END`](../state.md#end) state, the `success` argument is set to `true` otherwise it is set to `false`.

### `onUpdate(event)`

Is called every time a gesture is updated while it is in the [`ACTIVE`](../state.md#active) state.
