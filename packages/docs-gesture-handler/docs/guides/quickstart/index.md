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
import Step6 from './\_steps/step6.md';

RNGH3 offers a straightforward way to add gestures to your app. Simply wrap your target view with the [GestureDetector](/docs/fundamentals/gesture-detectors#gesture-detector) component, define your gesture, and pass it in. That’s it!

To see the new API in action, let's build a simple app where you can drag a ball around the screen. To follow along, you'll need both `react-native-gesture-handler` (to handle gestures) and `react-native-reanimated` (to handle the animations).

<Step title="Step 1">
  <div>Start by defining the basic structure of the application:</div>
  <Step1 />
</Step>

<Step title="Step 2">
  <div>Next, let's add the necessary styles:</div>
  <Step2 />
</Step>

<Step title="Step 3">
  <div>
Next, define the <a href="https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#shared-value">shared values</a> to track the ball's position and create the animated styles required to position the ball on the screen:
  </div>
  <Step3 />
</Step>

<Step title="Step 4">
  <div>Apply the animated styles to the ball component:</div>
  <Step4 />
</Step>

<Step title="Step 5">
  <div>
    Now, define the <code>Pan</code> gesture logic:
  </div>
  <Step5 />
</Step>

<Step title="Step 6">
  <div>
Finally, assign the <code>Pan</code> gesture to the <code>GestureDetector</code>:
  </div>
  <Step6 />
</Step>

Note the `start` shared value. We need it to store the position of the ball at the moment we grab it to be able to correctly position it later, because we only have access to translation relative to the starting point of the gesture.

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
  const start = useSharedValue({ x: 0, y: 0 });

  const gesture = usePanGesture({
    onBegin: () => {
      'worklet';
      isPressed.value = true;
    },
    onUpdate: (e) => {
      'worklet';
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    },
    onDeactivate: () => {
      'worklet';
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    },
    onFinalize: () => {
      'worklet';
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
