Gesture that can recognize hovering above the view it's attached to. The hover effect may be activated by moving a mouse or a stylus over the view.

On iOS additional [visual effects](#effect-ios-only) may be configured.

> **Note**
>
> Don't rely on `Hover` gesture to continue after the mouse button is clicked or the stylus touches the screen. If you want to handle both cases, [compose](/docs/fundamentals/gesture-composition) it with [`Pan`](/docs/gestures/use-pan-gesture) gesture.

## Example

## Config

### effect

Visual effect applied to the view while the view is hovered. Defaults to `HoverEffect.None`.

## Callbacks

## Event data

### x

```ts
x: number;
```

X coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](/docs/fundamentals/gesture-detectors#gesture-detector). Expressed in point units.

### y

```ts
y: number;
```

Y coordinate of the current position of the pointer relative to the view attached to the [`GestureDetector`](/docs/fundamentals/gesture-detectors#gesture-detector). Expressed in point units.

### absoluteX

```ts
absoluteX: number;
```

X coordinate of the current position of the pointer relative to the window. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### absoluteY

```ts
absoluteY: number;
```

Y coordinate of the current position of the pointer relative to the window. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

### stylusData

```ts
stylusData: StylusData;
```

```ts
interface StylusData {
  tiltX: number;
  tiltY: number;
  azimuthAngle: number;
  altitudeAngle: number;
  pressure: number;
}
```

Object that contains additional information about `stylus`. It consists of the following fields:

* [`tiltX`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX) - angle in degrees between the Y-Z plane of the stylus and the screen.
* [`tiltY`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY) - angle in degrees between the X-Z plane of the stylus and the screen.
* [`altitudeAngle`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/altitudeAngle) - angle between stylus axis and the X-Y plane of a device screen.
* [`azimuthAngle`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/azimuthAngle) - angle between the Y-Z plane and the plane containing both the stylus axis and the Y axis.
* [`pressure`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure) - indicates the normalized pressure of the stylus.
