---
id: native-gesture
title: Native gesture
sidebar_label: Native gesture
sidebar_position: 11
---

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinuousEventCallbacks from './\_shared/base-continuous-gesture-callbacks.md';

A gesture that allows other touch handling components to participate in RNGH's gesture system. When used, the other component should be the direct child of a `GestureDetector`.

## Reference

```jsx
import { ScrollView } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const native = Gesture.Native();

  return (
    <GestureDetector gesture={native}>
      <ScrollView>
        {/* Scrollable content */}
      </ScrollView>
    </GestureDetector>
  );
}
```

:::danger
Do not use `Native` gesture with components exported by React Native Gesture Handler. Those come with a native gesture handler preapplied. Attaching a native gesture twice will likely result in the components not working as intended.
:::

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

## Example

This example renders a `ScrollView` with multiple colored rectangles, where each rectangle has a black section. Starting a touch on a black section will disable the `ScrollView` for the duration of the `Pan` gesture.

```jsx
import { View, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const COLORS = ['red', 'green', 'blue', 'purple', 'orange', 'cyan'];

export default function App() {
  const native = Gesture.Native();

  return (
    <GestureDetector gesture={native}>
      <ScrollView style={{ flex: 1 }}>
        <ScrollableContent scrollGesture={native} />
      </ScrollView>
    </GestureDetector>
  );
}

function ScrollableContent({ scrollGesture }) {
  return (
    <View>
      {COLORS.map((color) => (
        <Rectangle key={color} color={color} scrollGesture={scrollGesture} />
      ))}
    </View>
  );
}

function Rectangle({ color, scrollGesture }) {
  const pan = Gesture.Pan().blocksExternalGesture(scrollGesture);

  return (
    <View
      key={color}
      style={{ width: '100%', height: 250, backgroundColor: color }}>
      <GestureDetector gesture={pan}>
        <View style={{ width: '100%', height: 50, backgroundColor: 'black' }} />
      </GestureDetector>
    </View>
  );
}
```
