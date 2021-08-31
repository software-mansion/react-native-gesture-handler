---
id: gesture-detector
title: GestureDetector
sidebar_label: Gesture detector
---

`GestureDetector` is the main component of the RNGH2. It is responsible for creating and updating native gesture handlers. The most significant difference between it and old gesture handlers is that the `GestureDetector` can recognize more than one gesture at the time.

## Properties

### `gesture`

A gesture object containing the configuration and callbacks. Can be any of the base gestures (`Tap`, `Pan`, `LongPress`, `Fling`, `Pinch`, `Rotation`, `ForceTouch`) or any `ComposedGesture` (`FirstOf`, `Simultaneous`, `Exclusive`).

### `animatedGesture`

Same as `gesture` but intended to use alongside `react-native-reanimated`. At the moment all callbacks must be marked as `worklet` or wrapped with `createWorklet` function and all calls to external functions must be wrapped with `runOnJS`. In case both `animatedGesture` and `gesture` are provided, the `animatedGesture` will be used.
