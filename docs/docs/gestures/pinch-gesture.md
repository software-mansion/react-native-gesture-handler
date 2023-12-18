---
id: pinch-gesture
title: Pinch gesture
sidebar_label: Pinch gesture
sidebar_position: 7
---

import useBaseUrl from '@docusaurus/useBaseUrl';

<div style={{ display: 'flex', margin: '16px 0', justifyContent: 'center' }}>
  <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
    <source src={useBaseUrl("/video/pinch.mp4")} type="video/mp4"/>
  </video>
</div>

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseContinousEventConfig from './\_shared/base-continous-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinousEventCallbacks from './\_shared/base-continous-gesture-callbacks.md';

A continuous gesture that recognizes pinch gesture. It allows for tracking the distance between two fingers and use that information to scale or zoom your content.
The gesture [activates](/docs/fundamentals/states-events#active) when fingers are placed on the screen and change their position.
Gesture callback can be used for continuous tracking of the pinch gesture. It provides information about velocity, anchor (focal) point of gesture and scale.

The distance between the fingers is reported as a scale factor. At the beginning of the gesture, the scale factor is 1.0. As the distance between the two fingers increases, the scale factor increases proportionally.
Similarly, the scale factor decreases as the distance between the fingers decreases.
Pinch gestures are used most commonly to change the size of objects or content onscreen.
For example, map views use pinch gestures to change the zoom level of the map.

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const pinch = Gesture.Pinch();

  return (
    <GestureDetector gesture={pinch}>
      <Animated.View />
    </GestureDetector>
  );
}
```

## Config

<BaseEventConfig />
<BaseContinousEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinousEventCallbacks />

## Event data

### Event attributes specific to `PinchGesture`:

### `scale`

The scale factor relative to the points of the two touches in screen coordinates.

### `velocity`

Velocity of the pan gesture the current moment. The value is expressed in point units per second.

### `focalX`

Position expressed in points along X axis of center anchor point of gesture

### `focalY`

Position expressed in points along Y axis of center anchor point of gesture

<BaseEventData />

## Example

```jsx
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export default function App() {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
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
