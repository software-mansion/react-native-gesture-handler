---
id: native-gesture
title: Native gesture
sidebar_label: Native gesture
sidebar_position: 11
---

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinousEventCallbacks from './\_shared/base-continous-gesture-callbacks.md';

A gesture that allows other touch handling components to participate in RNGH's gesture system. When used, the other component should be the direct child of a `GestureDetector`.

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const native = Gesture.Native();

  return (
    <GestureDetector gesture={native}>
      <View />
    </GestureDetector>
  );
}
```

## Config

### Properties specific to `NativeGesture`:

### `shouldActivateOnStart(value: boolean)` (**Android only**)

When `true`, underlying handler will activate unconditionally when in `BEGAN` or `UNDETERMINED` state.

### `disallowInterruption(value: boolean)`

When `true`, cancels all other gesture handlers when this `NativeViewGestureHandler` receives an `ACTIVE` state event.

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />

## Event data

### Event attributes specific to `NativeGesture`:

### `pointerInside`

True if gesture was performed inside of containing view, false otherwise.

<BaseEventData />
