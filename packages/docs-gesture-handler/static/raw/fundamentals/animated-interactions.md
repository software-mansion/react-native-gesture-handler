Using hook API allows for smooth integration with the [Animated API](https://reactnative.dev/docs/animated) by allowing for passing an `Animated.event` as the argument to the [`onUpdate`](/docs/fundamentals/callbacks-events#onupdate) callback. The event mapping of `Animated.event` depends on the [`useNativeDriver`](https://reactnative.dev/docs/animated#using-the-native-driver) property.

When using Animated API, remember to set `useAnimated` property to `true`.

:::danger Mixing Reanimated and Animated
It is not possible to mix Reanimated and Animated within any of the [gesture detectors](/docs/fundamentals/gesture-detectors).
:::

## useNativeDriver

When using `Animated.event` with `useNativeDriver` set to `false`, it is required to set [`disableReanimated`](/docs/fundamentals/reanimated-interactions#disablereanimated) to `true` in the gesture configuration.

Mapping of `Animated.event` depends on the value of `useNativeDriver` property. When set to `true`, event data can be accessed through `nativeEvent.handlerData` property:

```jsx
  const value = useAnimatedValue(0);

  const event = Animated.event(
    [{ nativeEvent: { handlerData: { /* translationX: value, ... */ } } }],
    { useNativeDriver: true }
  );
```

In case of `useNativeDriver` set to `false`, event data is accessed directly:

```jsx
  const value = useAnimatedValue(0);

  const event = Animated.event(
    [ { /* translationX: value, ... */ } ],
    { useNativeDriver: false }
  );
```

## Usage with VirtualGestureDetector

Using `Animated.event` with [`VirtualGestureDetector`](/docs/fundamentals/gesture-detectors#virtualgesturedetector) is possible only when `useNativeDriver` is set to `false`.
