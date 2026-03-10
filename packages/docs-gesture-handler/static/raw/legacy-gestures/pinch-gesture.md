A continuous gesture that recognizes pinch gesture. It allows for tracking the distance between two fingers and use that information to scale or zoom your content.
The gesture [activates](/docs/2.x/fundamentals/states-events#active) when fingers are placed on the screen and change their position.
Gesture callback can be used for continuous tracking of the pinch gesture. It provides information about velocity, anchor (focal) point of gesture and scale.

The distance between the fingers is reported as a scale factor. At the beginning of the gesture, the scale factor is 1.0. As the distance between the two fingers increases, the scale factor increases proportionally.
Similarly, the scale factor decreases as the distance between the fingers decreases.
Pinch gestures are used most commonly to change the size of objects or content onscreen.
For example, map views use pinch gestures to change the zoom level of the map.

Pinch Gesture

## Example

```jsx
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export default function App() {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // highlight-next-line
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
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

* When implementing pinch based on `focal` point, make sure to use it after gesture has activated, i.e. in `onStart`, `onUpdate` or `onChange` callbacks. Using it in `onBegan` may lead to unexpected behavior.

## Config

## Callbacks

## Event data

### Event attributes specific to `PinchGesture`:

### `scale`

The scale factor relative to the points of the two touches in screen coordinates.

### `velocity`

Velocity of the pan gesture the current moment. The value is expressed in scale factor per second.

### `focalX`

Position expressed in points along X axis of center anchor point of gesture

### `focalY`

Position expressed in points along Y axis of center anchor point of gesture
