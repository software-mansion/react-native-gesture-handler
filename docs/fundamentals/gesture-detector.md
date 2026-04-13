## Gesture Detector

The `GestureDetector` is a key component of `react-native-gesture-handler`. It supports gestures created either using the hook-based API or the builder pattern. Additionally, it allows for the recognition of multiple gestures through [gesture composition](/docs/fundamentals/gesture-composition). `GestureDetector` interacts closely with [`Reanimated`](https://docs.swmansion.com/react-native-reanimated/). For more details, refer to the [Integration with Reanimated](/docs/fundamentals/reanimated-interactions) section.

When using hook API, you can also integrate it directly with the [Animated API](https://reactnative.dev/docs/animated). More on that can be found in [Integration with Animated](/docs/fundamentals/animated-interactions) section.

> **Danger**
>
> #### Nesting Gesture Detectors
>
> Because `GestureDetector` supports both the hook API and the builder pattern, it is important to avoid nesting detectors that use different APIs, as this can result in undefined behavior.
>
> #### Reusing Gestures
>
> Using the same instance of a gesture across multiple Gesture Detectors may result in undefined behavior.

```js
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';

export default function App() {
  const tap = useTapGesture({
    onDeactivate: () => {
      console.log('Tap!');
    },
  });

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

## Virtual Detectors

Since RNGH3, `GestureDetector` is a standalone host component. Depending on the view hierarchy, this can occasionally disrupt interactions between specific components. To resolve this, use `InterceptingGestureDetector` in combination with `VirtualNativeDetector`.

### InterceptingGestureDetector

`InterceptingGestureDetector` functions similarly to a `GestureDetector`, but it can also act as a proxy for `VirtualGestureDetector` within its component subtree. Because it can be used solely to establish the context for virtual detectors, the [`gesture`](#gesture) property is optional.

### VirtualGestureDetector

`VirtualGestureDetector` is similar to the `GestureDetector` from RNGH2. Because it is not a host component, it does not interfere with the host view hierarchy. This allows you to attach gestures without disrupting functionality that depends on it.

### Known use cases

Here are some of the most common use cases for virtual gesture detectors.

#### SVG

You can combine `VirtualGestureDetector` with [`react-native-svg`](https://github.com/software-mansion/react-native-svg) to add gesture handling to individual `SVG` elements.

#### Text

You can use `VirtualGestureDetector` to add gesture handling to specific parts of a `Text` component.

## Properties

### gesture

```ts
gesture: SingleGesture | ComposedGesture;
```

A gesture object containing the configuration and callbacks. Can be any of the base gestures or any [`ComposedGesture`](/docs/fundamentals/gesture-composition).

### userSelect

```ts
userSelect: 'none' | 'auto' | 'text';
```

This parameter allows specifying which `userSelect` property should be applied to the underlying view. Default value is set to `"none"`.

### touchAction

```ts
touchAction: TouchAction;
```

This parameter allows specifying which `touchAction` property should be applied to the underlying view. Supports all CSS [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) values. Default value is set to `"none"`.

### enableContextMenu

```ts
enableContextMenu: boolean;
```

Specifies whether the context menu should be enabled after clicking on the underlying view with the right mouse button. Default value is set to `false`.
