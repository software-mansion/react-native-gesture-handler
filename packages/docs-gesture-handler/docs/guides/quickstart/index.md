---
id: quickstart
title: Quick start
sidebar_label: Quick start
sidebar_position: 1
---

import Step, { Divider } from '@site/src/theme/Step';
import Step1 from './\_steps/step1.md';
import Step2 from './\_steps/step2.md';
import Step3 from './\_steps/step3.md';
import Step4 from './\_steps/step4.md';
import Step5 from './\_steps/step5.md';

RNGH3 offers a straightforward way to add gestures to your app. Simply wrap your target view with the [GestureDetector](/docs/fundamentals/gesture-detectors#gesture-detector) component, define your gesture, and pass it in. That’s it!

To see the new API in action, let's build a simple app where you can drag a ball around the screen. To follow along, you'll need both `react-native-gesture-handler` (to handle gestures) and [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) (to handle the animations).

<Step title="Step 1">
  <div>Start by defining the basic structure of the application:</div>
  <Step1 />
</Step>

<Step title="Step 2">
  <div>
    Next, define the <a href="https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#shared-value">`SharedValues`</a> to track the ball's position and create the animated styles required to position the ball on the screen:
  </div>
  <Step2 />
</Step>

<Step title="Step 3">
  <div>Apply the animated styles to the ball component:</div>
  <Step3 />
</Step>

<Step title="Step 4">
  <div>
    Now, define the <code>Pan</code> gesture logic.
  </div>
  <Step4 />
</Step>

<Step title="Step 5">
  <div>
    Finally, wrap the component responsible for rendering the ball with a <code>GestureDetector</code>, and attach the <code>Pan</code> gesture to it:
  </div>
  <Step5 />
</Step>

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
