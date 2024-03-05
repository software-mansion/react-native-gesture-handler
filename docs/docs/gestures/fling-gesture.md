---
id: fling-gesture
title: Fling gesture
sidebar_label: Fling gesture
sidebar_position: 8
---

import useBaseUrl from '@docusaurus/useBaseUrl';

<div style={{ display: 'flex', margin: '16px 0', justifyContent: 'center' }}>
  <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
    <source src={useBaseUrl("/video/fling.mp4")} type="video/mp4"/>
  </video>
</div>

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';

A discrete gesture that activates when the movement is sufficiently long and fast.
Gesture gets [ACTIVE](/docs/fundamentals/states-events#active) when movement is sufficiently long and it does not take too much time.
When gesture gets activated it will turn into [END](/docs/fundamentals/states-events#end) state when finger is released.
The gesture will fail to recognize if the finger is lifted before being activated.

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const fling = Gesture.Fling();

  return (
    <GestureDetector gesture={fling}>
      <Animated.View />
    </GestureDetector>
  );
}
```

## Config

### Properties specific to `FlingGesture`:

### `direction(value: Directions)`

Expressed allowed direction of movement. Expected values are exported as constants in the `Directions` object. It's possible to pass one or many directions in one parameter:

```js
import { Directions } from 'react-native-gesture-handler';
fling.direction(Directions.RIGHT | Directions.LEFT);
```

or

```js
fling.direction(Directions.DOWN);
```

### `numberOfPointers(value: number)`

Determine exact number of points required to handle the fling gesture.

### `mouseButton(value: MouseButton)` (Web & Android only)

Allows users to choose which mouse button should handler respond to. The enum `MouseButton` consists of the following predefined fields:

- `LEFT`
- `RIGHT`
- `MIDDLE`
- `BUTTON_4`
- `BUTTON_5`
- `ALL`

Arguments can be combined using `|` operator, e.g. `mouseButton(MouseButton.LEFT | MouseButton.RIGHT)`. Default value is set to `MouseButton.LEFT`.

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />

## Event data

### Event attributes specific to `FlingGesture`:

### `x`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `y`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

<BaseEventData />

## Example

```jsx
import { StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  Directions,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function App() {
  const position = useSharedValue(0);

  const flingGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onStart((e) => {
      position.value = withTiming(position.value + 10, { duration: 100 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <GestureDetector gesture={flingGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 120,
    width: 120,
    backgroundColor: '#b58df1',
    borderRadius: 20,
    marginBottom: 30,
  },
});
```
