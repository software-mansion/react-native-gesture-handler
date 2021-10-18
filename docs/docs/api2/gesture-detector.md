---
id: gesture-detector
title: GestureDetector
sidebar_label: Gesture detector
---

`GestureDetector` is the main component of the RNGH2. It is responsible for creating and updating native gesture handlers. The most significant difference between it and old gesture handlers is that the `GestureDetector` can recognize more than one gesture at the time.

## Properties

### `gesture`

A gesture object containing the configuration and callbacks. Can be any of the base gestures (`Tap`, `Pan`, `LongPress`, `Fling`, `Pinch`, `Rotation`, `ForceTouch`) or any `ComposedGesture` (`Race`, `Simultaneous`, `Exclusive`). If `react-native-reanimated` is installed, Gesture Handler will automatically use features it provides as long as any of the callbacks is a `worklet` (Reanimated will auto-workletize gesture callbacks).
