RNGH3 offers a straightforward way to add gestures to your app. Simply wrap your target view with the [GestureDetector](/docs/fundamentals/gesture-detectors#gesture-detector) component, define your gesture, and pass it in. That’s it!

To see the new API in action, let's build a simple app where you can drag a ball around the screen. To follow along, you'll need both `react-native-gesture-handler` (to handle gestures) and [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) (to handle the animations).

Start by defining the basic structure of the application:

Next, define the `SharedValues` to track the ball's position and create the animated styles required to position the ball on the screen:

Apply the animated styles to the ball component:

Now, define the Pan gesture logic.

Finally, wrap the component responsible for rendering the ball with a GestureDetector, and attach the Pan gesture to it:

The complete implementation is shown below:

```jsx
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export default function Ball() {
  const isPressed = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });

  const gesture = usePanGesture({
    onBegin: () => {
      isPressed.value = true;
    },
    onUpdate: (e) => {
      offset.value = {
        x: offset.value.x + e.changeX,
        y: offset.value.y + e.changeY,
      };
    },
    onFinalize: () => {
      isPressed.value = false;
    },
  });

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: withSpring(isPressed.value ? 1.2 : 1) },
      ],
      backgroundColor: isPressed.value ? 'yellow' : 'blue',
    };
  });

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.ball, animatedStyles]} />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  ball: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
});
```
