---
id: long-press-gesture
title: Long press gesture
sidebar_label: Long press gesture
sidebar_position: 5
---

import { vanishOnMobile, appearOnMobile, webContainer } from '@site/src/utils/getGestureStyles';

import useBaseUrl from '@docusaurus/useBaseUrl';

import LongPressGestureBasic from '@site/static/examples/LongPressGestureBasic';
import LongPressGestureBasicSrc from '!!raw-loader!@site/static/examples/LongPressGestureBasic';

<div className={webContainer}>
  <div className={vanishOnMobile} style={{ display: 'flex', justifyContent: 'center', maxWidth: 360 }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/longpress.mp4")} type="video/mp4"/>
    </video>
  </div>
  <InteractiveExample
    component={<LongPressGestureBasic/>}
    src={LongPressGestureBasicSrc}
    disableMarginBottom={true}
  />
</div>

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';

A discrete gesture that activates when the corresponding view is pressed for a sufficiently long time.
This gesture's state will turn into [END](/docs/2.x/fundamentals/states-events#end) immediately after the finger is released.
The gesture will fail to recognize a touch event if the finger is lifted before the [minimum required time](/docs/2.x/gestures/long-press-gesture#mindurationvalue-number) or if the finger is moved further than the [allowable distance](/docs/2.x/gestures/long-press-gesture#maxdistancevalue-number).

<div className={appearOnMobile} style={{ display: 'flex', justifyContent: 'center' }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/longpress.mp4")} type="video/mp4"/>
    </video>
</div>

<samp id="LongPressGestureBasic">Long Press Gesture</samp>

## Example

```jsx
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function App() {
  // highlight-next-line
  const longPressGesture = Gesture.LongPress().onEnd((e, success) => {
    if (success) {
      console.log(`Long pressed for ${e.duration} ms!`);
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

## Config

### Properties specific to `LongPressGesture`:

### `minDuration(value: number)`

Minimum time, expressed in milliseconds, that a finger must remain pressed on the corresponding view. The default value is 500.

### `maxDistance(value: number)`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel during a long press gesture. If the finger travels further than the defined distance and the gesture hasn't yet [activated](/docs/2.x/fundamentals/states-events#active), it will fail to recognize the gesture. The default value is 10.

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

### Event attributes specific to `LongPressGesture`:

### `x`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector).

### `y`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector).

### `absoluteX`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. It is recommended to use `absoluteX` instead of [`x`](#x) in cases when the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector) can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. It is recommended to use `absoluteY` instead of [`y`](#y) in cases when the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector) can be transformed as an effect of the gesture.

### `duration`

Duration of the long press (time since the start of the gesture), expressed in milliseconds.

<BaseEventData />
