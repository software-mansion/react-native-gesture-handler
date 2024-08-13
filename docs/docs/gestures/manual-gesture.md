---
id: manual-gesture
title: Manual gesture
sidebar_label: Manual gesture
sidebar_position: 12
---

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinuousEventCallbacks from './\_shared/base-continuous-gesture-callbacks.md';

A plain gesture that has no specific activation criteria nor event data set. Its state has to be controlled manually using a [state manager](/docs/gestures/state-manager). It will not fail when all the pointers are lifted from the screen.

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const manual = Gesture.Manual();

  return (
    <GestureDetector gesture={manual}>
      <Animated.View />
    </GestureDetector>
  );
}
```

## Config

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinuousEventCallbacks />

## Event data

<BaseEventData />
