---
id: gesture-detectors
title: Gesture Detectors
sidebar_label: Gesture detectors
sidebar_position: 11
---

## `GestureDetector`

`GestureDetector` is the core component of RNGH3. Unlike in previous version, it no longer manages the lifecycle of gestures directly. It supports recognizing multiple gestures through [gesture composition](/docs/fundamentals/gesture-composition).

To facilitate a smooth migration, the gesture property accepts both RNGH3 and RNGH2 gestures.

:::danger Mixing API
While `GestureDetector` accepts both RNGH3 and RNGH2 gestures, it is not possible to mix them.
:::

When using RNGH3 gestures, you can also integrate them directly with the [Animated API](https://reactnative.dev/docs/animated).

### Example

#### Simple example

```js
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';

export default function App() {
  const tap = useTapGesture({});

  return (
    <GestureHandlerRootView>
      // highlight-next-line
      <GestureDetector gesture={tap}>
        <Animated.View />
        // highlight-next-line
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
```

#### Usage with Animated API

```js
import * as React from 'react';
import { Animated, useAnimatedValue } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  usePanGesture,
} from 'react-native-gesture-handler';

export default function App() {
  const value = useAnimatedValue(0);
  const event = Animated.event(
    [{ nativeEvent: { handlerData: { translationX: value } } }],
    {
      useNativeDriver: true,
    }
  );

  const gesture = usePanGesture({
    onUpdate: event,
  });

  return (
    <GestureHandlerRootView>
      // highlight-next-line
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              width: 150,
              height: 150,
              backgroundColor: '#b58df1',
            },
            { transform: [{ translateX: value }] },
          ]}
        />
        // highlight-next-line
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
```

## `InterceptingGestureDetector`

## `VirtualGestureDetector`

## Properties

### `gesture`

A gesture object containing the configuration and callbacks. Can be any of the base gestures (`Tap`, `Pan`, `LongPress`, `Fling`, `Pinch`, `Rotation`, `ForceTouch`) or any [`ComposedGesture`](/docs/fundamentals/gesture-composition) (`Competing`, `Simultaneous`, `Exclusive`).

:::info
`GestureDetector` will decide whether to use `Reanimated` to process provided gestures based on their configuration. If any of the callbacks is a worklet and `Reanimated` is not explicitly turned off, tools provided by the `Reanimated` will be utilized bringing ability to handle gestures synchronously.
:::

### `userSelect` (Web only)

This parameter allows to specify which `userSelect` property should be applied to underlying view. Possible values are `"none" | "auto" | "text"`. Default value is set to `"none"`.

### `touchAction` (Web only)

This parameter allows to specify which `touchAction` property should be applied to underlying view. Supports all CSS [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) values. Default value is set to `"none"`.

### `enableContextMenu(value: boolean)` (Web only)

Specifies whether context menu should be enabled after clicking on underlying view with right mouse button. Default value is set to `false`.

## Remarks

- Using the same instance of a gesture across multiple Gesture Detectors is not possible. Have a look at the code below:

  ```jsx
  export default function Example() {
    const pan = usePanGesture({});

    return (
      <View>
        // highlight-next-line
        <GestureDetector gesture={pan}>
          <View>
            // highlight-next-line
            <GestureDetector gesture={pan}>
              <View />
            </GestureDetector>
          </View>
        </GestureDetector>
      </View>
    );
  }
  ```

  This example will throw an error, becuse we try to use the same instance of `Pan` in two different Gesture Detectors.
