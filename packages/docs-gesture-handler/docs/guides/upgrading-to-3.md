---
id: upgrading-to-3
title: Upgrading to the new API introduced in Gesture Handler 3
---

## Migrating gestures

The most important change brought by the Gesture Handler 3 is the new hook API. Migration is pretty straight-forward. Instead of calling builder methods, everything is passed into configuration object. So, the code like this:

```tsx
const gesture = Gesture.Pan()
  .onBegin(() => {
    console.log('Pan!');
  })
  .minDistance(25);
```

Now looks like this:

```tsx
const gesture = usePanGesture({
  onBegin: () => {
    console.log('Pan!');
  },
  minDistance: 25,
});
```

:::danger Force Touch Gesture
[`ForceTouch`](/docs/2.x/gestures/force-touch-gesture) gesture is not available in hook API.
:::

### Renamed callbacks

In Gesture Handler 3 some of the callbacks were renamed, namely:

| RNGH3     | RNGH3          |
| --------- | -------------- |
| `onStart` | `onActivate`   |
| `onEnd`   | `onDeactivate` |

So the following code from Gesture Handler 2:

```tsx
const gesture = Gesture.Pan()
  .onStart(() => {
    console.log('Pan start!');
  })
  .onEnd(() => {
    console.log('Pan end!');
  });
```

in Gesture Handler 3 looks like this:

```tsx
const gesture = usePanGesture({
  onActivate: () => {
    console.log('Pan activated!');
  },
  onDeactivate: () => {
    console.log('Pan deactivated!');
  },
});
```

<details>
<summary>Full changes</summary>

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
| `Gesture.ForceTouch()` |                         |

</details>

## Migrating relations

### Composed gestures

Previously, composed gestures were created using `Gesture` object. In Gesture Handler 3, relations are set up using relation hooks. For example, the following code from Gesture Handler 2:

```tsx
const pan1 = Gesture.Pan();
const pan2 = Gesture.Pan();

const gesture = Gesture.Simultaneous(pan1, pan2);
```

in Gesture Handler 3 looks like this:

```tsx
const pan1 = usePanGesture({});
const pan2 = usePanGesture({});

const gesture = useSimultaneousGestures(pan1, pan2);
```

:::danger Race gesture
In Gesture Handler 3 `Race` gesture was renamed to `Competing` gesture.
:::

### Cross components relations properties

Properties used to define cross-components interactions were renamed. For example, the following code from Gesture Handler 2:

```tsx
const pan1 = Gesture.Pan();
const pan2 = Gesture.Pan().requireExternalGestureToFail(pan1);
```

in Gesture Handler 3 looks like this:

```tsx
const pan1 = usePanGesture({});
const pan2 = usePanGesture({
  requireToFail: pan1,
});
```

<details>
<summary>Full changes</summary>

| RNGH2                                     | RNGH3                       |
| ----------------------------------------- | --------------------------- |
| `Gesture.Race()`                          | `useCompetingGestures()`    |
| `Gesture.Simultaneous()`                  | `useSimultaneousGestures()` |
| `Gesture.Exclusive()`                     | `useExclusiveGestures()`    |
|                                           |                             |
| `gesture.simultaneousWithExternalGesture` | `gesture.simultaneousWith`  |
| `gesture.requireExternalGestureToFail`    | `gesture.requireToFail`     |
| `gesture.blocksExternalGesture`           | `gesture.block`             |

</details>

## Using SVG

In Gesture Handler 2 it was possible to use `GestureDetector` directly on `SVG`:

```tsx
// highlight-next-line
<GestureDetector gesture={containerTap}>
  <Svg>
    // highlight-next-line
    <GestureDetector gesture={circleElementTap}>
      <Circle />
    </GestureDetector>
  </Svg>
</GestureDetector>
```

In Gesture Handler 3, the correct way to interact with `SVG` is to use `InterceptingGestureDetector` and `VirtualGestureDetector`:

```tsx
// highlight-next-line
<InterceptingGestureDetector gesture={containerTap}>
  <Svg>
    // highlight-next-line
    <VirtualGestureDetector gesture={circleElementTap}>
      <Circle />
    </VirtualGestureDetector>
  </Svg>
</InterceptingGestureDetector>
```

:::danger Detectors order
`VirtualGestureDetector` has to be a child of `InterceptingGestureDetector`.
:::

## Old components

Components were rewritten to use new hook API. If for some reason you need to use old components, they now also use `Legacy` prefix, e.g. `RectButton` becomes `LegacyRectButton`.

<details>
<summary>Full changes</summary>

| RNGH2                 | RNGH3                       |
| --------------------- | --------------------------- |
| `RawButton`           | `LegacyRawButton`           |
| `BaseButton`          | `LegacyBaseButton`          |
| `RectButton`          | `LegacyRectButton`          |
| `BorderlessButton`    | `LegacyBorderlessButton`    |
|                       |                             |
| `ScrollView`          | `LegacyScrollView`          |
| `FlatList`            | `LegacyFlatList`            |
| `RefreshControl`      | `LegacyRefreshControl`      |
| `Switch`              | `LegacySwitch`              |
| `TextInput`           | `LegacyTextInput`           |
| `DrawerLayoutAndroid` | `LegacyDrawerLayoutAndroid` |

</details>

## Replaced types

Most of the types, like `TapGesture`, are still present in Gesture Handler 3. However, they are now used in new hook API. Types for old API now have `Legacy` prefix, e.g. `TapGesture` becomes `LegacyTapGesture`.

<details>
<summary>Full changes</summary>

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
|                         |                               |
| `ScrollView`            | `LegacyScrollView`            |
| `FlatList`              | `LegacyFlatList`              |
| `RefreshControl`        | `LegacyRefreshControl`        |
| `Switch`                | `LegacySwitch`                |
| `TextInput`             | `LegacyTextInput`             |
| `DrawerLayoutAndroid`   | `LegacyDrawerLayoutAndroid`   |

</details>
