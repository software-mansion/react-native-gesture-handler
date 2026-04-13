## Migrating gestures

The most important change brought by Gesture Handler 3 is the new hook API. Migration is pretty straightforward. Instead of calling builder methods, everything is passed as a configuration object.

[`ForceTouch`](/docs/2.x/gestures/force-touch-gesture) gesture is not available in hook API.

Full changes

| RNGH2                  | RNGH3                   |
| ---------------------- | ----------------------- |
| `Gesture.Pan()`        | `usePanGesture()`       |
| `Gesture.Tap()`        | `useTapGesture()`       |
| `Gesture.LongPress()`  | `useLongPressGesture()` |
| `Gesture.Rotation()`   | `useRotationGesture()`  |
| `Gesture.Pinch()`      | `usePinchGesture()`     |
| `Gesture.Fling()`      | `useFlingGesture()`     |
| `Gesture.Hover()`      | `useHoverGesture()`     |
| `Gesture.Native()`     | `useNativeGesture()`    |
| `Gesture.Manual()`     | `useManualGesture()`    |
| `Gesture.ForceTouch()` | *Not available in hook API* |

### Renamed callbacks

In Gesture Handler 3 some of the callbacks were renamed, namely:

| RNGH2     | RNGH3          |
| --------- | -------------- |
| `onStart` | `onActivate`   |
| `onEnd`   | `onDeactivate` |
| `onTouchesCancelled`   | `onTouchesCancel` |

Here is a comparison of the two APIs:

### onChange

`onChange` callback has been removed, and its functionality has been integrated into `onUpdate`. You can now access `change*` properties in `onUpdate` callback.

### state & oldState

The `state` and `oldState` properties are no longer available in event objects. Tracking state changes can now only be accomplished using the appropriate [callbacks](/docs/fundamentals/callbacks-events).

### Event types

The types of events have been unified for all callbacks. Each event falls into one of two categories: [`GestureEvent`](/docs/fundamentals/callbacks-events#gestureevent) for gesture callbacks, or [`GestureTouchEvent`](/docs/fundamentals/callbacks-events#touchevent) for `TouchEvent` callbacks.

### StateManager

In Gesture Handler 3, `stateManager` is no longer passed to `TouchEvent` callbacks. Instead, you should use the global [`GestureStateManager`](/docs/fundamentals/state-manager).

## Migrating relations

### Composed gestures

Previously, composed gestures were created using `Gesture` object. In Gesture Handler 3, relations are set up using relation hooks.

Full changes are as follows:

| RNGH2                                     | RNGH3                       |
| ----------------------------------------- | --------------------------- |
| `Gesture.Race()`                          | `useCompetingGestures()`    |
| `Gesture.Simultaneous()`                  | `useSimultaneousGestures()` |
| `Gesture.Exclusive()`                     | `useExclusiveGestures()`    |

### Cross components relations properties

Properties used to define cross-components interactions were renamed.

Full changes are as follows:

| RNGH2                                     | RNGH3                       |
| ----------------------------------------- | --------------------------- |
| `gesture.simultaneousWithExternalGesture` | `gesture.simultaneousWith`  |
| `gesture.requireExternalGestureToFail`    | `gesture.requireToFail`     |
| `gesture.blocksExternalGesture`           | `gesture.block`             |

## Migrating components relying on view hierarchy

Certain components, such as `SVG`, depend on the view hierarchy to function correctly. In Gesture Handler 3, `GestureDetector` disrupts these hierarchies. To resolve this issue, two new detectors have been introduced: [`InterceptingGestureDetector`](/docs/fundamentals/gesture-detectors#interceptinggesturedetector) and [`VirtualGestureDetector`](/docs/fundamentals/gesture-detectors#virtualgesturedetector).

:::danger Detectors order
`VirtualGestureDetector` has to be a descendant of `InterceptingGestureDetector`.
:::

### Migrating SVG

In Gesture Handler 2, it was possible to use `GestureDetector` directly on `SVG`. In Gesture Handler 3, the correct way to interact with `SVG` is to use `InterceptingGestureDetector` and `VirtualGestureDetector`.

## Old components

### Buttons

RNGH3 introduces the [`Touchable`](/docs/components/touchable) component — a flexible, unified replacement for all previous button types. While `Touchable` shares most of the logic with our standard buttons, it offers a more customizable API.

To help you migrate, here is the current state of our button components:

* [`Touchable`](/docs/components/touchable) - The recommended component. Can be used to replicate both `RectButton` and `BorderlessButton` effects by adjusting the `activeOpacity` and `activeUnderlayOpacity` props.
  * To replace `RectButton`, add `activeUnderlayOpacity={0.105}`.
  * To replace `BorderlessButton`, add `activeOpacity={0.3}`.

* Standard Buttons (Deprecated) - `BaseButton`, `RectButton` and `BorderlessButton` are still available but are now deprecated. They have been internally rewritten using the new Hooks API to resolve long-standing issues.

* Legacy Buttons (Deprecated): The original, pre-rewrite versions are still accessible, but have been renamed with a `Legacy` prefix (e.g., `LegacyRectButton`).

Although the legacy JS implementation of the buttons is still available, they also use the new host component internally. Because of that, `PureNativeButton` is no longer available in Gesture Handler 3.

Legacy buttons

| RNGH2                 | RNGH3                       |
| --------------------- | --------------------------- |
| `RawButton`           | `LegacyRawButton`           |
| `BaseButton`          | `LegacyBaseButton`          |
| `RectButton`          | `LegacyRectButton`          |
| `BorderlessButton`    | `LegacyBorderlessButton`    |
| `PureNativeButton`    | *Not available in Gesture Handler 3*    |

### Touchables

[`Touchable`](/docs/components/touchable) can also be used as a substitute for old, deprecated `Touchables`.

* To replace `TouchableOpacity`, add `activeOpacity={0.2}`.
* To replace `TouchableHighlight`, add `activeUnderlayOpacity={1}`.
* To replace `TouchableNativeFeedback`, add `androidRipple` property with `foreground: true`.
* `TouchableWithoutFeedback` can be replaced with a plain `Touchable`.

### Other components

Other components have also been internally rewritten using the new hook API but are exported under their original names, so no changes are necessary on your part. However, if you need to use the previous implementation for any reason, the old components are also available and are prefixed with `Legacy`, e.g., `ScrollView` is now available as `LegacyScrollView`.

Legacy components

| RNGH2                 | RNGH3                       |
| --------------------- | --------------------------- |
| `ScrollView`          | `LegacyScrollView`          |
| `FlatList`            | `LegacyFlatList`            |
| `RefreshControl`      | `LegacyRefreshControl`      |
| `Switch`              | `LegacySwitch`              |
| `TextInput`           | `LegacyTextInput`           |
| `DrawerLayoutAndroid` | `LegacyDrawerLayoutAndroid` |

### createNativeWrapper

`createNativeWrapper` is deprecated and it is now exported as `legacy_createNativeWrapper`.

## Replaced types

Most of the types, like `TapGesture`, are still present in Gesture Handler 3. However, they are now used in new hook API. Types for old API now have `Legacy` prefix, e.g. `TapGesture` becomes `LegacyTapGesture`.

Legacy types

| RNGH2                   | RNGH3                         |
| ----------------------- | ----------------------------- |
| `PanGesture`            | `LegacyPanGesture`            |
| `TapGesture`            | `LegacyTapGesture`            |
| `LongPressGesture`      | `LegacyLongPressGesture`      |
| `RotationGesture`       | `LegacyRotationGesture`       |
| `PinchGesture`          | `LegacyPinchGesture`          |
| `FlingGesture`          | `LegacyFlingGesture`          |
| `HoverGesture`          | `LegacyHoverGesture`          |
| `NativeGesture`         | `LegacyNativeGesture`         |
| `ManualGesture`         | `LegacyManualGesture`         |
| `ForceTouchGesture`     | `LegacyForceTouchGesture`     |
|                         |                               |
| `ComposedGesture`       | `LegacyComposedGesture`       |
| `RaceGesture`           | `LegacyRaceGesture`           |
| `SimultaneousGesture`   | `LegacySimultaneousGesture`   |
| `ExclusiveGesture`      | `LegacyExclusiveGesture`      |
|                         |                               |
| `RawButtonProps`        | `LegacyRawButtonProps`        |
| `BaseButtonProps`       | `LegacyBaseButtonProps`       |
| `RectButtonProps`       | `LegacyRectButtonProps`       |
| `BorderlessButtonProps` | `LegacyBorderlessButtonProps` |
