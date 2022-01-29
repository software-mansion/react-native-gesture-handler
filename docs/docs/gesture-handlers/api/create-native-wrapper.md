---
id: create-native-wrapper
title: createNativeWrapper
sidebar_label: createNativeWrapper()
---

:::info
We recently released RNGH 2.0 with new Gestures system. Check out [RNGH 2.0
section in Introduction](../../introduction.md#rngh-20) for more information.
:::

Creates provided component with NativeViewGestureHandler, allowing it to be part of RNGH's
gesture system.

## Arguments

### Component

The component we want to wrap.

### config

Config is an object with properties that can be used on [`NativeViewGestureHandler`](./nativeview-gh.md)

## Returns

Wrapped component.
