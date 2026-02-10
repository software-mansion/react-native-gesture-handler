---
name: gesture-handler-3-migration
description: Migrates files containing React Native components which use the React Native Gesture Handler 2 API to Gesture Handler 3.
---

# Migrate to Gesture Handler 3

This skill scans React Native components that use the Gesture Handler builder-based API and updates them to use the new hook-based API. It also updates related types and components to adapt to the new version.

## When to Use

- Updating the usage of components imported from `react-native-gesture-handler`
- Upgrading to Gesture Handler 3
- Migrating to the new hook-based gesture API

## Instructions

Use the instructions below to correctly replace all legacy APIs with the modern ones.

1. Identify all imports from 'react-native-gesture-handler'
2. For each `Gesture.X()` call, replace with corresponding `useXGesture()` hook
3. Replace `Gesture` import with imports for the used hooks
4. Convert builder method chains to configuration objects
5. Update callback names (onStart → onActivate, etc.)
6. Replace composed gestures with relation hooks. Keep rules of hooks in mind
7. Update GestureDetector usage if SVG is involved to Intercepting/Virtual GestureDetector
8. Update usage of compoenent imported from 'react-native-gesture-handler' according to "Legacy components" section

### Migrating gestures

All hook gestures have their counterparts in the builder API: `Gesture.X()` becomes `useXGesture(config)`. The methods are now config object fields with the same name as the relevant builder methods, unless specified otherwise.

The exception to thait is `Gesture.ForceTouch` which DOES NOT have a counterpart in the hook API.

#### Callback changes

In Gesture Handler 3 some of the callbacks were renamed, namely:

- `onStart` -> `onActivate`
- `onEnd` -> `onDeactivate`
- `onTouchesCancelled` -> `onTouchesCancel`

In the hooks API `onChange` is no longer available. Instead the `*change*` properties were moved to the event available inside `onUpdate`.

All callbacks of a gesture are now using the same type:

- `usePanGesture()` -> `PanGestureEvent`
- `useTapGesture()` -> `TapGestureEvent`
- `useLongPressGesture()` -> `LongPressGestureEvent`
- `useRotationGesture()` -> `RotationGestureEvent`
- `usePinchGesture()` -> `PinchGestureEvent`
- `useFlingGesture()` -> `FlingGestureEvent`
- `useHoverGesture()` -> `HoverGestureEvent`
- `useNativeGesture()` -> `RotationGestureEvent`
- `useManualGesture()` -> `ManualGestureEvent`

The exception to this is touch events:

- `onTouchesDown`
- `onTouchesUp`
- `onTouchesMove`
- `onTouchesCancel`

Where each callback receives `GestureTouchEvent` regardless of the hook used.

#### StateManager

In Gesture Handler 3, `stateManager` is no longer passed to `TouchEvent` callbacks. Instead, you should use the global `GestureStateManager`.

`GestureStateManager` provides methods for imperative state management:

- .begin(handlerTag: number)
- .activate(handlerTag: number)
- .deactivate(handlerTag: number) (.end() in the old API)
- .fail(handlerTag: number)

`handlerTag` can be obtained in two ways:

1. From the gesture object returned by the hook (`gesture.handlerTag`)
2. From the event inside callback (`event.handlerTag`)

Callback definitions CANNOT reference the gesture that's being defined. In this scenario use events to get access to the handler tag.

### Migrating relations

#### Composed gestures

`Gesture.Simultaneous(gesture1, gesture2);` becomes `useSimultaneousGestures(pan1, pan2);`

All relations from the old API and their counterparts in the new one:

- `Gesture.Race()` -> `useCompetingGestures()`
- `Gesture.Simultaneous()` -> `useSimultaneousGestures()`
- `Gesture.Exclusive()` -> `useExclusiveGestures()`

#### Cross components relations properties

Properties used to define cross-components interactions were renamed:

- `.simultaneousWithExternalGesture` -> `simultaneousWith:`
- `.requireExternalGestureToFail` -> `requireToFail:`
- `.blocksExternalGesture` -> `block:`

### GestureDetector

The `GestureDetector` is a key component of `react-native-gesture-handler`. It supports gestures created either using the hooks API or the builder pattern (but those cannot be mixed, it's either or).

Don't use the same instance of a gesture across multiple Gesture Detectors as it will lead to an undefined behavior.

### Integration with Reanimated

Worklets' Babel plugin is setup in a way that automatically marks callbacks passed to gestures in the configuration chain as worklets. This means that you don't need to add a `'worklet';` directive at the beginning of the functions.

This will not be workletized because the callback is defined outside of the gesture object:

```jsx
const callback = () => {
  console.log(_WORKLET);
};

const gesture = useTapGesture({
  onBegin: callback,
});
```

The callback wrapped by any other higher order function will not be workletized:

```jsx
const gesture = useTapGesture({
  onBegin: useCallback(() => {
    console.log(_WORKLET);
  }, []),
});
```

In the above cases, you should add a `"worklet";` directive as the first line of the callback.

### Disabling Reanimated

Gestures created with the hook API have `Reanimated` integration enabled by default (if it's installed), meaning all callbacks are executed on the UI thread.

#### runOnJS

The `runOnJS` property allows you to dynamically control whether callbacks are executed on the JS thread or the UI thread. When set to `true`, callbacks will run on the JS thread. Setting it to `false` will execute them on the UI thread. Default value is `false`.

### Migrating components relying on view hierarchy

Certain components, such as `SVG`, depend on the view hierarchy to function correctly. In Gesture Handler 3, `GestureDetector` disrupts these hierarchies. To resolve this issue, two new detectors have been introduced: `InterceptingGestureDetector` and `VirtualGestureDetector`.

`InterceptingGestureDetector` functions similarly to the `GestureDetector`, but it can also act as a proxy for `VirtualGestureDetector` within its component subtree. Because it can be used solely to establish the context for virtual detectors, the `gesture` property is optional.

`VirtualGestureDetector` is similar to the `GestureDetector` from RNGH2. Because it is not a host component, it does not interfere with the host view hierarchy. This allows you to attach gestures without disrupting functionality that depends on it.

**Warning:** `VirtualGestureDetector` has to be a descendant of `InterceptingGestureDetector`.

#### Migrating SVG

In Gesture Handler 2 it was possible to use `GestureDetector` directly on `SVG`. In Gesture Handler 3, the correct way to interact with `SVG` is to use `InterceptingGestureDetector` and `VirtualGestureDetector`.

### Legacy components

When the code using the component relies on the APIs that are no longer available on the components in Gesture Handler 3 (like `waitFor`, `simultaneousWith`, `blocksHandler`, `onHandlerStateChange`, `onGestureEvent` props), it cannot be easily migrated in isolation. In this case update the imports to the Legacy version of the component, and inform the user that the dependencies need to be migrated first.

If the migration is possible, use the ask questions tool to clarify the user intent unless clearly stated beforehand: should the components be using the new implementation (no `Legacy` prefix when imported), or should they revert to the old implementation (`Legacy` prefix when imported)?

Don't suggest replacing buttons from Gesture Handler with components from React Native and vice versa.

The implementation of buttons has been updated, resolving most button-related issues. They have also been internally rewritten to utilize the new hook API. The legacy JS implementations of button components are still accessible but have been renamed with the prefix `Legacy`, e.g., `RectButton` is now available as `LegacyRectButton`. Those still use the new native component under the hood.

Other components have also been internally rewritten using the new hook API but are exported under their original names, so no changes are necessary on your part. However, if you need to use the previous implementation for any reason, the legacy components are also available and are prefixed with `Legacy`, e.g., `ScrollView` is now available as `LegacyScrollView`.

`createNativeWrapper` has been rewritten using the new hook API and exported under the original name. The old implementation is still available as `legacy_createNativeWrapper`. It also accepts new optional parameter - `detectorType`, which allows you to specify the type of the gesture detector that will be used internally. By default it uses `GestureDetector`.

While new `createNativeWrapper` should work out of the box, keep in mind that it wraps your component with `GestureDetector`, which in Gesture Handler 3 is a host component. This affects view hierarchy, so depending on use case, you might want to use `VirtualGestureDetector` instead.

Before changing, ask user about their intention - if they prefer to keep legacy version, change it to `legacy_createNativeWrapper`. If not, keep `createNativeWrapper`, then notify user that in case of problems with view hierarchy they should wrap the relevant subtree with `InterceptingGestureDetector` and pass `GestureDetectorType.Virtual` as the `detectorType` argument in `createNativeWrapper`.

### Replaced types

Most of the types used in the builder API, like `TapGesture`, are still present in Gesture Handler 3. However, they are now used in new hook API. Types for builder API now have `Legacy` prefix, e.g. `TapGesture` becomes `LegacyTapGesture`.
