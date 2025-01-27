---
id: create-native-wrapper
title: createNativeWrapper
sidebar_label: createNativeWrapper()
sidebar_position: 13
---

:::warning
The old API will be removed in the future version of Gesture Handler. Please migrate to [gestures API](/docs/gestures/gesture) instead. Check out our [upgrading guide](/docs/guides/upgrading-to-2) for more information.
:::

Creates provided component with NativeViewGestureHandler, allowing it to be part of RNGH's
gesture system.

## Arguments

### Component

The component we want to wrap.

### config

Config is an object with properties that can be used on [`NativeViewGestureHandler`](/docs/gesture-handlers/nativeview-gh)

## Returns

Wrapped component.
