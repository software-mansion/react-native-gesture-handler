---
id: manual-gestures
title: Manual gestures
sidebar_label: Manual gestures
sidebar_position: 2
---

import Step, { Divider } from '@site/src/theme/Step';
import Step1 from './\_steps/step1.md';
import Step2 from './\_steps/step2.md';
import Step3 from './\_steps/step3.md';
import Step4 from './\_steps/step4.md';
import Step5 from './\_steps/step5.md';
import Step6 from './\_steps/step6.md';
import Step7 from './\_steps/step7.md';

RNGH3 comes with [manual gestures](/docs/gestures/use-manual-gesture), that allow users to fully control their behavior.

## Manual gestures example

To demonstrate how to make a manual gesture we will make a simple one that tracks all pointers on the screen.

<Step title="Step 1">
    First, we need a way to store information about the pointer: whether it should be visible and its position.
    <Step1 />
</Step>

<Step title="Step 2">
    We also need a component to mark where a pointer is. In order to accomplish that we will make a component that accepts two [shared values](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#shared-value): one holding information about the pointer using the interface we just created, the other holding a bool indicating whether the gesture has activated.
    In this example when the gesture is not active, the ball representing it will be blue and when it is active the ball will be red and slightly bigger.
    <Step2 />
</Step>

<Step title="Step 3">
    Now we have to make a component that will handle the gesture and draw all the pointer indicators. We will store data about pointers in an array and render them inside an [`Animated.View`](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation#using-an-animated-component).
    <Step3 />
</Step>

<Step title="Step 4">
    We have our components set up and we can finally get to making the gesture! We will start with `onTouchesDown` where we need to set position of the pointers and make them visible. We can get this information from the touches property of the event. In this case we will also check how many pointers are on the screen and activate the gesture if there are at least two.
    <Step4 />
</Step>

<Step title="Step 5">
    Next, we will handle pointer movement. In `onTouchesMove` we will simply update the position of moved pointers.
    <Step5 />
</Step>

<Step title="Step 6">
    We also need to handle lifting fingers from the screen, which corresponds to `onTouchesUp`. Here we will just hide the pointers that were lifted and end the gesture if there are no more pointers on the screen.
    Note that we are not handling `onTouchesCancelled` as in this very basic case we don't expect it to happen, however you should clear data about cancelled pointers (most of the time all active ones) when it is called.
    <Step6 />
</Step>

<Step title="Step 7">
    Now that our pointers are being tracked correctly and we have the state management, we can handle activation and ending of the gesture. In our case, we will simply set the active shared value either to `true` or `false`.
    <Step7 />
</Step>

And that's all! As you can see using manual gestures is really easy but they are also very powerful tool.

## Modifying existing gestures

While manual gestures open great possibilities we are aware that reimplementing pinch or rotation from scratch just because you need to activate in specific circumstances or require position of the fingers, would be a waste of time as those gestures are already available. Therefore, you can use touch events with every gesture to extract more detailed information about the gesture than what the basic events alone provide. We also added a `manualActivation` modifier on all continuous gestures, which prevents the gesture it is applied to from activating automatically, giving you full control over its behavior.

## Full example code

```tsx
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  GestureStateManager,
  useManualGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  useSharedValue,
} from 'react-native-reanimated';

type Pointer = {
  x: number;
  y: number;
  visible: boolean;
};

type PointerElementProps = {
  pointer: SharedValue<Pointer>;
  active: SharedValue<boolean>;
};

function PointerElement(props: PointerElementProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: props.pointer.value.x },
      { translateY: props.pointer.value.y },
      {
        scale:
          (props.pointer.value.visible ? 1 : 0) *
          (props.active.value ? 1.3 : 1),
      },
    ],
    backgroundColor: props.active.value ? 'red' : 'blue',
  }));

  return <Animated.View style={[styles.pointer, animatedStyle]} />;
}

export default function Example() {
  const trackedPointers: SharedValue<Pointer>[] = [];
  const active = useSharedValue(false);

  for (let i = 0; i < 10; i++) {
    trackedPointers[i] = useSharedValue<Pointer>({
      x: 0,
      y: 0,
      visible: false,
    });
  }

  const gesture = useManualGesture({
    onTouchesDown: (e) => {
      for (const touch of e.changedTouches) {
        trackedPointers[touch.id].value = {
          x: touch.x,
          y: touch.y,
          visible: true,
        };
      }

      if (e.numberOfTouches >= 2) {
        GestureStateManager.activate(e.handlerTag);
      }
    },
    onTouchesMove: (e) => {
      for (const touch of e.changedTouches) {
        trackedPointers[touch.id].value = {
          x: touch.x,
          y: touch.y,
          visible: true,
        };
      }
    },
    onTouchesUp: (e) => {
      for (const touch of e.changedTouches) {
        trackedPointers[touch.id].value = {
          x: touch.x,
          y: touch.y,
          visible: false,
        };
      }

      if (e.numberOfTouches === 0) {
        GestureStateManager.deactivate(e.handlerTag);
      }
    },
    onActivate: () => {
      active.value = true;
    },
    onDeactivate: () => {
      active.value = false;
    },
  });

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={gesture}>
        <Animated.View style={{ flex: 1 }}>
          {trackedPointers.map((pointer, index) => (
            <PointerElement pointer={pointer} active={active} key={index} />
          ))}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  pointer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
    position: 'absolute',
    marginStart: -30,
    marginTop: -30,
  },
});
```
