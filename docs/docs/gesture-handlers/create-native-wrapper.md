---
id: create-native-wrapper
title: createNativeWrapper
sidebar_label: createNativeWrapper()
sidebar_position: 13
---

:::warning
Consider using the new [gestures API](/docs/gestures/gesture) instead. The old API is not actively supported and is not receiving the new features. Check out [RNGH 2.0 section in Introduction](/docs/#rngh-20) for more information.
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
