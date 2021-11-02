---
id: gesture-detector
title: GestureDetector
sidebar_label: Gesture detector
---

`GestureDetector` is the main component of the RNGH2. It is responsible for creating and updating native gesture handlers based on the config of provided gesture. The most significant difference between it and old gesture handlers is that the `GestureDetector` can recognize more than one gesture at the time thanks to gesture composition. Keep in mind that `GestureDetector` is not compatible with the [Animated API](https://reactnative.dev/docs/animated), nor with [Reanimated 1](https://docs.swmansion.com/react-native-reanimated/docs/1.x.x/).

## Properties

### `gesture`

A gesture object containing the configuration and callbacks. Can be any of the base gestures (`Tap`, `Pan`, `LongPress`, `Fling`, `Pinch`, `Rotation`, `ForceTouch`) or any `ComposedGesture` (`Race`, `Simultaneous`, `Exclusive`).

:::info
GestureDetector will decide whether to use Reanimated to process provided gestures based on callbacks they have. If any of the callbacks is a worklet, toold provided by the Reanimated will be utilized bringing ability to handle gestures synchrously.
:::

<!-- TODO: Add information about which version of Reanimated provides state management -->
