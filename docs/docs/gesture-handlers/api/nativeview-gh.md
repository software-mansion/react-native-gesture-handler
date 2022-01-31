---
id: nativeview-gh
title: NativeViewGestureHandler
sidebar_label: NativeView
---

:::info
We recently released RNGH 2.0 with new Gestures system. Check out [RNGH 2.0
section in Introduction](../../introduction.md#rngh-20) for more information.
:::

A gesture handler that allows other touch handling components to participate in
RNGH's gesture system.

Used by [`createNativeWrapper()`](./create-native-wrapper.md).

## Properties

See [set of properties inherited from base handler class](./common-gh.md#properties). Below is a list of properties specific to `NativeViewGestureHandler` component:

### `shouldActivateOnStart` (**Android only**)

When `true`, underlying handler will activate unconditionally when in `BEGAN` or `UNDETERMINED` state.

### `disallowInterruption`

When `true`, cancels all other gesture handlers when this `NativeViewGestureHandler` receives an `ACTIVE` state event.
