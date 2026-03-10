[`GestureDetector`](/docs/fundamentals/gesture-detectors) will decide whether to use [Reanimated](https://docs.swmansion.com/react-native-reanimated/) to process provided gestures based on their configuration. If any of the callbacks is a [worklet](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary/#worklet) and Reanimated is not explicitly [turned off](#disabling-reanimated), tools provided by the Reanimated will be utilized, bringing the ability to handle gestures synchronously on the main thread.

## Automatic [workletization](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary/#to-workletize) of gesture callbacks

[Worklets' Babel plugin](https://docs.swmansion.com/react-native-worklets/docs/worklets-babel-plugin/about) is setup in a way that automatically marks callbacks passed to gestures in the configuration chain as worklets. This means that you don't need to add a `'worklet';` directive at the beginning of the functions. Here is an example that will be automatically workletized:

```jsx
const gesture = useTapGesture({
  onBegin: () => {
    console.log(_WORKLET);
  },
});
```

And here is one that won't:

```jsx
const callback = () => {
  console.log(_WORKLET);
};

const gesture = useTapGesture({
  onBegin: callback,
});
```

It also won't work when wrapped with hooks like `useCallback` or `useMemo`, e.g:

```jsx
const callback = useCallback(() => {
  console.log(_WORKLET);
}, []);

const gesture = useTapGesture({
  onBegin: callback,
});
```

In the above cases, you should add a `"worklet";` directive at the beginning of the callbacks, like so:

```jsx
const callback = () => {
  // highlight-next-line
  'worklet';
  console.log(_WORKLET);
};

const gesture = useTapGesture({
  onBegin: callback,
});
```

```jsx
const callback = useCallback(() => {
  // highlight-next-line
  'worklet;';
  console.log(_WORKLET);
}, []);

const gesture = useTapGesture({
  onBegin: callback,
});
```

## Using SharedValue in gesture config

RNGH3 allows to pass [`SharedValue`](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#shared-value) to gestures' configurations. This allows to react to configuration changes without unnecessary rerenders.

## Disabling Reanimated

Gestures created with the hook API have Reanimated integration enabled by default, meaning all callbacks are executed on the UI thread. There are two methods available to disable this behavior for a specific gesture.

### disableReanimated

When `disableReanimated` is set to `true` in the gesture configuration, Reanimated integration will be completely turned off for that gesture throughout its entire lifecycle. This setting eliminates all interaction points with Reanimated, thereby reducing any potential overhead. Default value for this property is `false`.

This property cannot be changed dynamically during the gesture's lifecycle.

```jsx
const gesture = usePanGesture({
  // highlight-next-line
  disableReanimated: true,

  onUpdate: () => {
    console.log('Panning');
  },
});
```

### runOnJS

The `runOnJS` property allows you to dynamically control whether callbacks are executed on the JS thread or the UI thread. When set to `true`, callbacks will run on the JS thread. Setting it to `false` will execute them on the UI thread. Default value for this property is `false`.

This property can be changed dynamically throughout the gesture's lifecycle.
