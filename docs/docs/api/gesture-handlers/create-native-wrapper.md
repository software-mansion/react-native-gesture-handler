---
id: create-native-wrapper
title: createNativeWrapper
sidebar_label: createNativeWrapper
---

Creates provided component with NativeViewGestureHandler, allowing it to be part of RNGH's
gesture system.

### Arguments

#### Component

The component we want to wrap.

#### config

Config accepts common gesture handlers properties and two additional ones:

- shouldActivateOnStart - if set to true, underlying handler will activate
  unconditionally when in `BEGAN` or `UNDETERMINED` state.
- disallowInterruption - if set to true, component will not be interrupted by
  activation of other handler (e.g. ScrollView handling touches).

### Returns

Wrapped component.
