---
id: nativeview-gh
title: NativeViewGestureHandler
sidebar_label: NativeView
sidebar_position: 12
---

:::warning
The old API will be removed in the future version of Gesture Handler. Please migrate to [gestures API](/docs/2.x/gestures/gesture) instead. Check out our [upgrading guide](/docs/2.x/guides/upgrading-to-2) for more information.
:::

A gesture handler that allows other touch handling components to participate in
RNGH's gesture system.

Used by [`createNativeWrapper()`](/docs/2.x/gesture-handlers/create-native-wrapper).

## Properties

See [set of properties inherited from base handler class](/docs/2.x/gesture-handlers/common-gh#properties). Below is a list of properties specific to `NativeViewGestureHandler` component:

### `shouldActivateOnStart` (**Android only**)

When `true`, underlying handler will activate unconditionally when in `BEGAN` or `UNDETERMINED` state.

### `disallowInterruption`

When `true`, cancels all other gesture handlers when this `NativeViewGestureHandler` receives an `ACTIVE` state event.
