---
id: hover-gesture
title: Hover gesture
sidebar_label: Hover gesture
sidebar_position: 6
---

import OldAPIInfo from './\_shared/v2-info.md'

<OldAPIInfo />

import { vanishOnMobile, appearOnMobile, webContainer } from '@site/src/utils/getGestureStyles';

import useBaseUrl from '@docusaurus/useBaseUrl';

import HoverGestureBasic from '@site/static/examples/HoverGestureBasic';
import HoverGestureBasicSrc from '!!raw-loader!@site/static/examples/HoverGestureBasic';

<div className={webContainer}>
  <div className={vanishOnMobile} style={{ display: 'flex', justifyContent: 'center', maxWidth: 360 }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/hover.mp4")} type="video/mp4"/>
    </video>
  </div>
  <InteractiveExample
    component={<HoverGestureBasic/>}
    src={HoverGestureBasicSrc}
    disableMarginBottom={true}
  />
</div>

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinuousEventCallbacks from './\_shared/base-continuous-gesture-callbacks.md';

A continuous gesture that can recognize hovering above the view it's attached to. The hover effect may be activated by moving a mouse or a stylus over the view.

On iOS additional visual effects may be configured.

  <div className={appearOnMobile} style={{ display: 'flex', justifyContent: 'center' }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/hover.mp4")} type="video/mp4"/>
    </video>
  </div>

<samp id="HoverGestureBasic">Hover Gesture</samp>

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const hover = Gesture.Hover();

  return (
    <GestureDetector gesture={hover}>
      <View />
    </GestureDetector>
  );
}
```

## Remarks

- Don't rely on `Hover` gesture to continue after the mouse button is clicked or the stylus touches the screen. If you want to handle both cases, [compose](/docs/2.x/fundamentals/gesture-composition) it with [`Pan` gesture](/docs/2.x/gestures/pan-gesture).

## Config

### Properties specific to `HoverGesture`:

### `effect(effect: HoverEffect)` (iOS only)

```js
import { HoverEffect } from 'react-native-gesture-handler';
```

Visual effect applied to the view while the view is hovered. The possible values are:

- `HoverEffect.None`
- `HoverEffect.Lift`
- `HoverEffect.Highlight`

Defaults to `HoverEffect.None`

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinuousEventCallbacks />

## Event data

### Event attributes specific to `HoverGesture`:

### `x`

X coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector). Expressed in point units.

### `y`

Y coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer relative to the window. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer relative to the window. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

### `stylusData`

Object that contains additional information about `stylus`. It consists of the following fields:

- [`tiltX`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX) - angle in degrees between the Y-Z plane of the stylus and the screen.
- [`tiltY`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY) - angle in degrees between the X-Z plane of the stylus and the screen.
- [`altitudeAngle`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/altitudeAngle) - angle between stylus axis and the X-Y plane of a device screen.
- [`azimuthAngle`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/azimuthAngle) - angle between the Y-Z plane and the plane containing both the stylus axis and the Y axis.
- [`pressure`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure) - indicates the normalized pressure of the stylus.

<BaseEventData />
