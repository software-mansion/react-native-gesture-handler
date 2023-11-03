---
id: nativeview-gh
title: NativeViewGestureHandler
sidebar_label: NativeView
sidebar_position: 12
---

:::warning
Consider using the new [gestures API](/docs/gestures/gesture) instead. The old API is not actively supported and is not receiving the new features. Check out [RNGH 2.0 section in Introduction](/docs/#rngh-20) for more information.
:::

A gesture handler that allows other touch handling components to participate in
RNGH's gesture system.

Used by [`createNativeWrapper()`](/docs/gesture-handlers/create-native-wrapper).

## Properties

See [set of properties inherited from base handler class](/docs/gesture-handlers/common-gh#properties). Below is a list of properties specific to `NativeViewGestureHandler` component:

### `shouldActivateOnStart` (**Android only**)

When `true`, underlying handler will activate unconditionally when in `BEGAN` or `UNDETERMINED` state.

### `disallowInterruption`

When `true`, cancels all other gesture handlers when this `NativeViewGestureHandler` receives an `ACTIVE` state event.
