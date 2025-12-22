---
id: gesture-detector
title: GestureDetector
sidebar_label: Gesture detector
sidebar_position: 11
---

import FunctionalComponents from './\_shared/gesture-detector-functional1.md';

`GestureDetector` is the main component of the RNGH2. It is responsible for creating and updating native gesture handlers based on the config of provided gesture. The most significant difference between it and old gesture handlers is that the `GestureDetector` can recognize more than one gesture at the time thanks to gesture composition. Keep in mind that `GestureDetector` is not compatible with the [Animated API](https://reactnative.dev/docs/animated), nor with [Reanimated 1](https://docs.swmansion.com/react-native-reanimated/docs/1.x/).

## Reference

```javascript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function App() {
  const tap = Gesture.Tap();
  return (
    // highlight-next-line
    <GestureDetector gesture={tap}>
      <Animated.View />
      // highlight-next-line
    </GestureDetector>
  );
}
```

## Properties

### `gesture`

A gesture object containing the configuration and callbacks. Can be any of the base gestures (`Tap`, `Pan`, `LongPress`, `Fling`, `Pinch`, `Rotation`, `ForceTouch`) or any [`ComposedGesture`](/docs/fundamentals/gesture-composition) (`Race`, `Simultaneous`, `Exclusive`).

:::info
GestureDetector will decide whether to use Reanimated to process provided gestures based on callbacks they have. If any of the callbacks is a worklet, tools provided by the Reanimated will be utilized bringing ability to handle gestures synchronously.

Starting with Reanimated 2.3.0 Gesture Handler will provide a [StateManager](/docs/2.x/gestures/state-manager) in the [touch events](/docs/2.x/gestures/touch-events) that allows for managing the state of the gesture.
:::

### `userSelect` (Web only)

This parameter allows to specify which `userSelect` property should be applied to underlying view. Possible values are `"none" | "auto" | "text"`. Default value is set to `"none"`.

### `touchAction` (Web only)

This parameter allows to specify which `touchAction` property should be applied to underlying view. Supports all CSS `touch-action` values (e.g. `"none"`, `"pan-y"`). Default value is set to `"none"`.

### `enableContextMenu(value: boolean)` (Web only)

Specifies whether context menu should be enabled after clicking on underlying view with right mouse button. Default value is set to `false`.

## Remarks

- Gesture Detector will use first native view in its subtree to recognize gestures, however if this view is used only to group its children it may get automatically [collapsed](https://reactnative.dev/docs/view#collapsable-android). Consider this example:
  <FunctionalComponents />
  If we were to remove the collapsable prop from the View, the gesture would stop working because it would be attached to a view that is not present in the view hierarchy. Gesture Detector adds this prop automatically to its direct child but it's impossible to do automatically for more complex view trees.

- Using the same instance of a gesture across multiple Gesture Detectors is not possible. Have a look at the code below:

  ```jsx
  export default function Example() {
    const pan = Gesture.Pan();

    return (
      <View>
        <GestureDetector gesture={pan}>
          <View>
            <GestureDetector gesture={pan}>
              {' '}
              {/* Don't do this! */}
              <View />
            </GestureDetector>
          </View>
        </GestureDetector>
      </View>
    );
  }
  ```

  This example will throw an error, becuse we try to use the same instance of `Pan` in two different Gesture Detectors.
