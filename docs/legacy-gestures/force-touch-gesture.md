> **Warning**
>
> ForceTouch gesture is deprecated and will be removed in the future version of Gesture Handler.

A continuous gesture that recognizes force of a touch. It allows for tracking pressure of touch on some iOS devices.
The gesture [activates](/docs/2.x/fundamentals/states-events#active) when pressure of touch is greater than or equal to `minForce`. It fails if pressure is greater than `maxForce`.
Gesture callback can be used for continuous tracking of the touch pressure. It provides information for one finger (the first one).

At the beginning of the gesture, the pressure factor is 0.0. As the pressure increases, the pressure factor increases proportionally. The maximum pressure is 1.0.

There's no implementation provided on Android and it simply renders children without any wrappers.
Since this behaviour is only provided on some iOS devices, this gesture should not be used for defining any crucial behaviors. Use it only as an additional improvement and make all features to be accessed without this gesture as well.

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const forceTouch = Gesture.ForceTouch();

  return (
    <GestureDetector gesture={forceTouch}>
      <View />
    </GestureDetector>
  );
}
```

## Config

### Properties specific to `ForceTouchGesture`:

### `minForce(value: number)`

A minimal pressure that is required before the gesture can [activate](/docs/2.x/fundamentals/states-events#active). Should be a value from range `[0.0, 1.0]`. Default is `0.2`.

### `maxForce(value: number)`

A maximal pressure that could be applied for the gesture. If the pressure is greater, the gesture [fails](/docs/2.x/fundamentals/states-events#failed). Should be a value from range `[0.0, 1.0]`.

### `feedbackOnActivation(value: boolean)`

Value defining if haptic feedback has to be performed on activation.

## Callbacks

## Event data

### Event attributes specific to `ForceTouchGesture`:

### `force`

The pressure of a touch.
