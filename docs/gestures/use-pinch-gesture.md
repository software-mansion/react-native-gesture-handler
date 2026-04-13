Gesture that recognizes pinching. It allows for tracking the distance between two fingers and use that information to scale or zoom your content.
The gesture activates when fingers are placed on the screen and move away from each other or pull closer together. It provides information about [velocity](#velocity), anchor ([focal](#focalx)) point of gesture and [scale](#scale).

The distance between the fingers is reported as a scale factor. At the beginning of the gesture, the scale factor is `1.0`. As the distance between the two fingers increases, the scale factor increases proportionally.
Similarly, the scale factor decreases as the distance between the fingers decreases.

Pinch gestures are used most commonly to change the size of objects or content onscreen.
For example, map views use pinch gestures to change the zoom level of the map.

> **Note**
>
> When implementing pinch based on focal point, make sure to use it after the gesture had activated, i.e. in `onActivate` or `onUpdate` callbacks. Using it in `onBegin` may lead to unexpected behavior.

## Example

## Config

## Callbacks

## Event data

### scale

```ts
scale: number;
```

The scale factor relative to the points of the two touches in screen coordinates.

### scaleChange

```ts
scaleChange: number;
```

The incremental change in scale since the last event frame. This value represents the ratio of the current scale to the previous scale, rather than the total accumulated scale of the gesture.

### velocity

```ts
velocity: number;
```

Velocity of the pinch gesture at the current moment. The value is expressed in scale factor per second.

### focalX

```ts
focalX: number;
```

Position expressed in points along X axis of center anchor point of gesture.

### focalY

```ts
focalY: number;
```

Position expressed in points along Y axis of center anchor point of gesture.
