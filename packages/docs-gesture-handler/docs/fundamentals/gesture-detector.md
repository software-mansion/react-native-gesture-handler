---
id: gesture-detectors
title: Gesture Detectors
sidebar_label: Gesture detectors
sidebar_position: 3
---

## Gesture Detector

`GestureDetector` is the core component of RNGH3. Unlike in previous version, it no longer manages the lifecycle of gestures directly. It supports recognizing multiple gestures through [gesture composition](/docs/fundamentals/gesture-composition).

To facilitate a smooth migration, the gesture property accepts both gestures created using the hooks API and gestures created using the builder pattern.

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

## Virtual Detectors

In RNGH3, `GestureDetector` is a standalone native component. Depending on your view hierarchy, this can occasionally disrupt interactions between specific components. To resolve this, use `InterceptingGestureDetector` in combination with `VirtualNativeDetector`.

### InterceptingGestureDetector

`InterceptingGestureDetector` functions like a standard `GestureDetector`, but adds support for `VirtualGestureDetector` within its component subtree. Because it can be used solely to establish the context for virtual detectors, the [`gesture`](#gesture) property is optional.

### VirtualGestureDetector

`VirtualGestureDetector` is similar to the `GestureDetector` from RNGH2. Because it is not a native component, it does not interfere with the native view hierarchy. This allows you to attach gestures without disrupting functionality that depends on that hierarchy.

### Example

```js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GestureHandlerRootView,
  InterceptingGestureDetector,
  useTapGesture,
  VirtualGestureDetector,
} from 'react-native-gesture-handler';
import Svg, { Circle } from 'react-native-svg';

export default function App() {
  const outerTap = useTapGesture({});
  const innerTap = useTapGesture({});

  return (
    <GestureHandlerRootView style={styles.container}>
      // highlight-next-line
      <InterceptingGestureDetector gesture={innerTap}>
        <View style={styles.box}>
          <Svg height="250" width="250">
            // highlight-next-line
            <VirtualGestureDetector gesture={outerTap}>
              <Circle
                cx="125"
                cy="125"
                r="125"
                fill="#001A72"
                onPress={() => {}}
              />
              // highlight-next-line
            </VirtualGestureDetector>
          </Svg>
        </View>
        // highlight-next-line
      </InterceptingGestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: '#b58df1',
  },
});
```

## Interaction with Reanimated

`GestureDetector` will decide whether to use [Reanimated](https://docs.swmansion.com/react-native-reanimated/) to process provided gestures based on their configuration. If any of the callbacks is a worklet and Reanimated is not explicitly turned off, tools provided by the Reanimated will be utilized bringing ability to handle gestures synchronously.

## Properties

### gesture

```ts
gesture: SingleGesture | ComposedGesture;
```

A gesture object containing the configuration and callbacks. Can be any of the base gestures or any [`ComposedGesture`](/docs/fundamentals/gesture-composition).

### userSelect (Web only)

```ts
userSelect: 'none' | 'auto' | 'text';
```

This parameter allows to specify which `userSelect` property should be applied to underlying view. Default value is set to `"none"`.

### touchAction (Web only)

```ts
userSelect: TouchAction;
```

This parameter allows to specify which `touchAction` property should be applied to underlying view. Supports all CSS [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) values. Default value is set to `"none"`.

### enableContextMenu (Web only)

```ts
enableContextMenu: boolean;
```

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
