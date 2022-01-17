---
id: state-manager
title: Gesture state manager
sidebar_label: Gesture state manager
---

`GestureStateManager` allows to manually control the state of the gestures. Please note that `react-native-reanimated` is required to use it, since it allows for synchronously executing methods in worklets.

## Methods

### `begin()`

Transition the gesture to the [`BEGAN`](../../under-the-hood/states-events.md#began) state. This method will have no effect if the gesture has already activated or finished.

### `activate()`

Transition the gesture to the [`ACTIVE`](../../under-the-hood/states-events.md#active) state. This method will have no effect if the handler is already active, or has finished.
If the gesture is [`exclusive`](../../gesture-composition) with another one, the activation will be delayed until the gesture with higher priority fails.

### `end()`

Transition the gesture to the [`END`](../../under-the-hood/states-events.md#end) state. This method will have no effect if the handler has already finished.

### `fail()`

Transition the gesture to the [`FAILED`](../../under-the-hood/states-events.md#failed) state. This method will have no effect if the handler has already finished.
