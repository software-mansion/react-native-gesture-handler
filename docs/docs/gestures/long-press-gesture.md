---
id: long-press-gesture
title: Long press gesture
sidebar_label: Long press gesture
sidebar_position: 5
---

import useBaseUrl from '@docusaurus/useBaseUrl';

<div style={{ display: 'flex', margin: '16px 0', justifyContent: 'center' }}>
  <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
    <source src={useBaseUrl("/video/longpress.mp4")} type="video/mp4"/>
  </video>
</div>

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';

A discrete gesture that activates when the corresponding view is pressed for a sufficiently long time.
This gesture's state will turn into [END](../../under-the-hood/states-events.md#end) immediately after the finger is released.
The gesture will fail to recognize a touch event if the finger is lifted before the [minimum required time](#mindurationms) or if the finger is moved further than the [allowable distance](#maxdist).

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const longPress = Gesture.LongPress();

  return (
    <GestureDetector gesture={longPress}>
      <View />
    </GestureDetector>
  );
}
```

## Config

### Properties specific to `LongPressGesture`:

### `minDuration(value: number)`

Minimum time, expressed in milliseconds, that a finger must remain pressed on the corresponding view. The default value is 500.

### `maxDistance(value: number)`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel during a long press gesture. If the finger travels further than the defined distance and the gesture hasn't yet [activated](../../under-the-hood/states-events.md#active), it will fail to recognize the gesture. The default value is 10.

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />

## Event data

### Event attributes specific to `LongPressGesture`:

### `x`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md).

### `y`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md).

### `absoluteX`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. It is recommended to use `absoluteX` instead of [`x`](#x) in cases when the view attached to the [`GestureDetector`](./gesture-detector.md) can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. It is recommended to use `absoluteY` instead of [`y`](#y) in cases when the view attached to the [`GestureDetector`](./gesture-detector.md) can be transformed as an effect of the gesture.

### `duration`

Duration of the long press (time since the start of the gesture), expressed in milliseconds.

<BaseEventData />

## Example

```jsx
import { View, StyleSheet, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function App() {
  const longPressGesture = Gesture.LongPress().onEnd((e, success) => {
    if (success) {
      Alert.alert(`Long pressed for ${e.duration} ms!`);
    }
  });

  return (
    <GestureDetector gesture={longPressGesture}>
      <View style={styles.box} />
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
