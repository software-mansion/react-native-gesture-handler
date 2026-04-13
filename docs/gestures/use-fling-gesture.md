The gesture that tracks quick, sufficiently long movement in specified [direction](#direction).
When the gesture gets activated it will end when the finger is released.
The gesture will fail if the finger is lifted before the gesture could activate.

## Example

## Config

### direction

Expresses the allowed direction of movement. Expected values are exported as constants in the `Directions` object. It's possible to combine directions using `|` operator.

```js
import { Directions } from 'react-native-gesture-handler';

// Single direction
const fling = useFlingGesture({ direction: Directions.RIGHT });

// Combined directions
const fling = useFlingGesture({ direction: Directions.RIGHT | Directions.LEFT });
```

### numberOfPointers

```ts
numberOfPointers: number | SharedValue<number>;
```

Determines the exact number of pointers required to handle the fling gesture.

## Callbacks

## Event data

### x

```ts
x: number;
```

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](/docs/fundamentals/gesture-detectors#gesture-detector). Expressed in point units.

### y

```ts
y: number;
```

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](/docs/fundamentals/gesture-detectors#gesture-detector). Expressed in point units.

### absoluteX

```ts
absoluteX: number;
```

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### absoluteY

```ts
absoluteY: number;
```

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.
