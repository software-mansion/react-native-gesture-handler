---
id: state-manager
title: Gesture state manager
sidebar_label: Gesture state manager
sidebar_position: 15
---

`GestureStateManager` allows to manually control the state of the gestures. Please note that `react-native-reanimated` is required to use it, since it allows for synchronously executing methods in worklets.

## Methods

### `begin()`

Transition the gesture to the [`BEGAN`](/docs/fundamentals/states-events.md#began) state. This method will have no effect if the gesture has already activated or finished.

### `activate()`

Transition the gesture to the [`ACTIVE`](/docs/fundamentals/states-events#active) state. This method will have no effect if the handler is already active, or has finished.
If the gesture is [`exclusive`](/docs/fundamentals/gesture-composition) with another one, the activation will be delayed until the gesture with higher priority fails.

### `end()`

Transition the gesture to the [`END`](/docs/fundamentals/states-events.md#end) state. This method will have no effect if the handler has already finished.

### `fail()`

Transition the gesture to the [`FAILED`](/docs/fundamentals/states-events.md#failed) state. This method will have no effect if the handler has already finished.
