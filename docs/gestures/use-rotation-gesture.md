Gesture that can recognize rotation and track its movement.

The gesture activates when fingers are placed on the screen and rotate around a common point. It provides information such as the amount [rotated](#rotation), the focal point of the rotation ([anchor](#anchorx)), and its instantaneous [velocity](#velocity).

> **Note**
>
> When implementing rotation based on `anchor` point, make sure to use it after the gesture had activated, i.e. in `onActivate` or `onUpdate` callbacks. Using it in `onBegin` may lead to unexpected behavior.

## Example

## Config

## Callbacks

## Event data

### rotation

```ts
rotation: number;
```

Amount rotated, expressed in radians, from the gesture's focal point (anchor).

### rotationChange

```ts
rotationChange: number;
```

The incremental change in rotation since the last event frame. This value represents the difference in radians between the current and previous rotation, rather than the total accumulated rotation of the gesture.

### velocity

```ts
velocity: number;
```

Instantaneous velocity, expressed in point units per second, of the gesture.

### anchorX

```ts
anchorX: number;
```

X coordinate, expressed in points, of the gesture's central focal point (anchor).

### anchorY

```ts
anchorY: number;
```

Y coordinate, expressed in points, of the gesture's central focal point (anchor).
