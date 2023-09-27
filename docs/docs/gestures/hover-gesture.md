---
id: hover-gesture
title: Hover gesture
sidebar_label: Hover gesture
sidebar_position: 9
---

import useBaseUrl from '@docusaurus/useBaseUrl';

<div style={{ display: 'flex', margin: '16px 0', justifyContent: 'center' }}>
  <video playsInline autoPlay muted loop style={{maxWidth: 375}}>
    <source src={useBaseUrl("/video/hover.mp4")} type="video/mp4"/>
  </video>
</div>

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinousEventCallbacks from './\_shared/base-continous-gesture-callbacks.md';

A continuous gesture that can recognize hovering above the view it's attached to. The hover effect may be activated by moving a mouse or a stylus over the view.

On iOS additional visual effects may be configured.

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
<BaseContinousEventCallbacks />

## Event data

### Event attributes specific to `HoverGesture`:

### `x`

X coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `y`

Y coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer relative to the window. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer relative to the window. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

<BaseEventData />

## Remarks

- Don't rely on `Hover` gesture to continue after the mouse button is clicked or the stylus touches the screen. If you want to handle both cases, [compose](../../gesture-composition.md) it with [`Pan` gesture](./pan-gesture.md).
