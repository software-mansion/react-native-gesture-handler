---
id: gesture-detector
title: GestureDetector
sidebar_label: Gesture detector
---

import FunctionalComponents from './gesture-detector-functional1.md';

`GestureDetector` is the main component of the RNGH2. It is responsible for creating and updating native gesture handlers based on the config of provided gesture. The most significant difference between it and old gesture handlers is that the `GestureDetector` can recognize more than one gesture at the time thanks to gesture composition. Keep in mind that `GestureDetector` is not compatible with the [Animated API](https://reactnative.dev/docs/animated), nor with [Reanimated 1](https://docs.swmansion.com/react-native-reanimated/docs/1.x.x/).

:::caution
Gesture Detector will use first native view in its subtree to recognize gestures, however if this view is used only to group its children it may get automatically [collapsed](https://reactnative.dev/docs/view#collapsable-android). Consider this example:
<FunctionalComponents />
If we were to remove the collapsable prop from the View, the gesture would stop working because it would be attached to a view that is not present in the view hierarchy. Gesture Detector adds this prop automatically to its direct child but it's impossible to do automatically for more complex view trees.
:::

## Properties

### `gesture`

A gesture object containing the configuration and callbacks. Can be any of the base gestures (`Tap`, `Pan`, `LongPress`, `Fling`, `Pinch`, `Rotation`, `ForceTouch`) or any [`ComposedGesture`](./composed-gestures.md) (`Race`, `Simultaneous`, `Exclusive`).

:::info
GestureDetector will decide whether to use Reanimated to process provided gestures based on callbacks they have. If any of the callbacks is a worklet, tools provided by the Reanimated will be utilized bringing ability to handle gestures synchrously.

Starting with Reanimated-2.3.0-beta.4 Gesture Handler will provide a [StateManager](./state-manager.md) in the [touch events](./touch-events.md) that allows for managing the state of the gesture.
:::
