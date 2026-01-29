---
id: rotation-gesture
title: Rotation gesture
sidebar_label: Rotation gesture
sidebar_position: 6
---

import { vanishOnMobile, appearOnMobile, webContainer } from '@site/src/utils/getGestureStyles';

import useBaseUrl from '@docusaurus/useBaseUrl';

import RotationGestureBasic from '@site/static/examples/RotationGestureBasic';
import RotationGestureBasicSrc from '!!raw-loader!@site/static/examples/RotationGestureBasicSrc';

<div className={webContainer}>
  <div className={vanishOnMobile} style={{ display: 'flex', justifyContent: 'center', maxWidth: 360 }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/rotation.mp4")} type="video/mp4"/>
    </video>
  </div>
  <InteractiveExample
    component={<RotationGestureBasic/>}
    src={RotationGestureBasicSrc}
    disableMarginBottom={true}
  />
</div>

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseContinuousEventConfig from './\_shared/base-continuous-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinuousEventCallbacks from './\_shared/base-continuous-gesture-callbacks.md';

A continuous gesture that can recognize a rotation gesture and track its movement.

The gesture [activates](/docs/2.x/fundamentals/states-events#active) when fingers are placed on the screen and change position in a proper way.

Gesture callback can be used for continuous tracking of the rotation gesture. It provides information about the gesture such as the amount rotated, the focal point of the rotation (anchor), and its instantaneous velocity.

  <div className={appearOnMobile} style={{ display: 'flex', justifyContent: 'center' }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/rotation.mp4")} type="video/mp4"/>
    </video>
  </div>

<samp id="RotationGestureBasicSrc">Rotation Gesture</samp>

## Example

```jsx
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export default function App() {
  const rotation = useSharedValue(1);
  const savedRotation = useSharedValue(1);

  // highlight-next-line
  const rotationGesture = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${(rotation.value / Math.PI) * 180}deg` }],
  }));

  return (
    <GestureDetector gesture={rotationGesture}>
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

## Remarks

- When implementing rotation based on `anchor` point, make sure to use it after gesture has activated, i.e. in `onStart`, `onUpdate` or `onChange` callbacks. Using it in `onBegan` may lead to unexpected behavior.

## Config

<BaseEventConfig />
<BaseContinuousEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinuousEventCallbacks />

## Event data

### Event attributes specific to `RotationGesture`:

### `rotation`

Amount rotated, expressed in radians, from the gesture's focal point (anchor).

### `velocity`

Instantaneous velocity, expressed in point units per second, of the gesture.

### `anchorX`

X coordinate, expressed in points, of the gesture's central focal point (anchor).

### `anchorY`

Y coordinate, expressed in points, of the gesture's central focal point (anchor).

<BaseEventData />
