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

A gesture that allows other touch handling components to work within RNGH's gesture system. This streamlines interactions between gestures and the native component, allowing it to form [relations](/docs/2.x/fundamentals/gesture-composition) with other gestures.

When used, the native component should be the direct child of a `GestureDetector`.

## Example

This example renders a `ScrollView` with multiple colored rectangles, where each rectangle has a black section. Starting a touch on a black section will disable the `ScrollView` for the duration of the `Pan` gesture.

```jsx
import { View, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const COLORS = ['red', 'green', 'blue', 'purple', 'orange', 'cyan'];

export default function App() {
  // highlight-next-line
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

## Remarks

- `Native` gesture can be used as part of [gesture composition and cross-component interactions](/docs/2.x/fundamentals/gesture-composition) just like any other gesture. You can use this to block a native component for the duration of the gesture or to make it work alongside a gesture.

:::danger
Do not use `Native` gesture with components exported by React Native Gesture Handler. Those come with a native gesture handler preapplied. Attaching a native gesture twice will likely result in the components not working as intended.
:::

## Config

### Properties specific to `NativeGesture`:

### `shouldActivateOnStart(value: boolean)` (**Android only**)

When `true`, underlying handler will activate unconditionally when it receives any touches in [`BEGAN`](/docs/2.x/fundamentals/states-events#began) or [`UNDETERMINED`](/docs/2.x/fundamentals/states-events#undetermined) state.

### `disallowInterruption(value: boolean)`

When `true`, cancels all other gesture handlers when this `NativeViewGestureHandler` changes its state to [`ACTIVE`](/docs/2.x/fundamentals/states-events#active).

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />

## Event data

### Event attributes specific to `NativeGesture`:

### `pointerInside`

True if gesture was performed inside of containing view, false otherwise.

<BaseEventData />
