---
id: hover-gesture
title: Hover gesture
sidebar_label: Hover gesture
---

import BaseEventData from './base-gesture-event-data.md';
import BaseEventConfig from './base-gesture-config.md';
import BaseEventCallbacks from './base-gesture-callbacks.md';
import BaseContinousEventCallbacks from './base-continous-gesture-callbacks.md';

A continuous gesture that can recognize hovering above the view it's attached to. The hover effect may be activated by moving a mouse or a stylus over the view.

On iOS additional visual effects may be configured.

:::info
Don't rely on `Hover` gesture to continue after the mouse button is clicked or the stylus touches the screen. If you want to handle both cases, [compose](../../gesture-composition.md) it with [`Pan` gesture](./pan-gesture.md).
:::

## Config

### Properties specific to `HoverGesture`:

### `withFeedback(feedback: HoverFeedback)` (iOS only)

Visual feedback applied to the view while the view is hovered. The possible values are:

- `HoverFeedback.None`
- `HoverFeedback.Lift`
- `HoverFeedback.Highlight`

Defaults to `HoverFeedback.None`

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
