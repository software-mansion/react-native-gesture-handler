---
name: gesture-handler-3-migration
description: Migrates files containing React Native components which use the React Native Gesture Handler 2 API to Gesture Handler 3.
---

# Migrate to Gesture Handler 3

This skill goes over the components using the Gesture Handler builder-based API updates it to use the new hook-based API. It also handles updating types and components which may have changed in the new version.

## When to Use

- Updating the usage of components imported from `react-native-gesture-handler`
- Upgrading to Gesture Handler 3
- Migrating to the new hook-based gesture API

## Instructions

Use the instructions below to correctly replace all legacy APIs with the modern ones.

### Migrating gestures

The most important change brought by the Gesture Handler 3 is the new hooks API. Migration is pretty straightforward. Instead of calling builder methods, everything is passed as a configuration object.
Unless specified, the names and types of callbacks and properties remain unchanged.

Old API:
```js
import { Gesture } from 'react-native-gesture-handler';

const gesture = Gesture.Pan()
  .onBegin(() => {
    console.log('Pan!');
  })
  .minDistance(25);
```

New API:
```js
import { usePanGesture } from 'react-native-gesture-handler';

const gesture = usePanGesture({
  onBegin: () => {
    console.log('Pan!');
  },
  minDistance: 25,
});
````

`ForceTouch` gesture is not available in hooks API. If it's still being used, leave it as is.

All gestures from the old API and their counterparts in the new one:

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

#### Callback changes

In Gesture Handler 3 some of the callbacks were renamed, namely:

| RNGH2                  | RNGH3             |
| ---------              | --------------    |
| `onStart`              | `onActivate`      |
| `onEnd`                | `onDeactivate`    |
| `onTouchesCancelled`   | `onTouchesCancel` |

Old API:
```js
import { Gesture } from 'react-native-gesture-handler';

const gesture = Gesture.Pan()
  .onStart(() => {
    console.log('Pan activated!');
  })
  .onEnd(() => {
    console.log('Pan deactivated!');
  })
  .onTouchesCancelled(() => {
    console.log('Touches canceled!');
  });
```

New API:
```js
import { usePanGesture } from 'react-native-gesture-handler';

const gesture = usePanGesture({
  onActivate: () => {
    console.log('Pan activated!');
  },
  onDeactivate: () => {
    console.log('Pan deactivated!');
  },
  onTouchesCancel: () => {
    console.log('Touches canceled!');
  },
});
```

In the hooks API `onChange` is no longer available. Instead the `*change*` properties were moved to the event available inside `onUpdate`.

Old API:
```js
import { Gesture } from 'react-native-gesture-handler';

const gesture = Gesture.Pan()
  .onChange((event) => {
    console.log(event.changeX, event.changeY);
  })
```

New API:
```js
import { usePanGesture } from 'react-native-gesture-handler';

const gesture = usePanGesture({
  onUpdate: (event) => {
    console.log(event.changeX, event.changeY);
  }
});
```

#### StateManager

In Gesture Handler 3, `stateManager` is no longer passed to `TouchEvent` callbacks. Instead, you should use the global `GestureStateManager`.

`GestureStateManager` provides methods for iperative state management:
- .begin(handlerTag: number)
- .activate(handlerTag: number)
- .deactivate(handlerTag: number) (.end() in the old API)
- .fail(handlerTag: number)

`handlerTag` can be obtained in two ways:
1. From the gesture object returned by the hook (`gesture.handlerTag`)
2. From the event inside callback (`event.handlerTag`)

Callback definitions CANNOT reference the gesture that's being defined. In this scenario use events to get access to the handler tag.

Old API:
```js
import { Gesture } from 'react-native-gesture-handler';

const manual = Gesture.Manual().onTouchesDown((e, stateManager) => {
  stateManager.activate();
});
```

New API:
```js
import { useManualGesture, GestureStateManager } from 'react-native-gesture-handler';

const manual = useManualGesture({
  onTouchesDown: (e) => {
    GestureStateManager.activate(e.handlerTag);
  },
});
```

### Migrating relations

#### Composed gestures

Previously, composed gestures were created using `Gesture` object. In Gesture Handler 3, relations are set up using relation hooks.

Old API:
```js
import { Gesture } from 'react-native-gesture-handler';

const pan1 = Gesture.Pan();
const pan2 = Gesture.Pan();

const gesture = Gesture.Simultaneous(pan1, pan2);
```

New API:
```js
import { usePanGesture, useSimultaneousGestures } from 'react-native-gesture-handler';

const pan1 = usePanGesture({});
const pan2 = usePanGesture({});

const gesture = useSimultaneousGestures(pan1, pan2);
```

All relations from the old API and their counterparts in the new one:

| RNGH2                                     | RNGH3                       |
| ----------------------------------------- | --------------------------- |
| `Gesture.Race()`                          | `useCompetingGestures()`    |
| `Gesture.Simultaneous()`                  | `useSimultaneousGestures()` |
| `Gesture.Exclusive()`                     | `useExclusiveGestures()`    |


#### Cross components relations properties

Properties used to define cross-components interactions were renamed.

Old API:
```js
import { Gesture } from 'react-native-gesture-handler';

const pan1 = Gesture.Pan();
const pan2 =
    Gesture.Pan().requireExternalGestureToFail(pan1);
```

New API:
```js
import { usePanGesture } from 'react-native-gesture-handler';

const pan1 = usePanGesture({});
const pan2 = usePanGesture({
  requireToFail: pan1,
});
```

Full changes are as follows:

| RNGH2                                     | RNGH3                       |
| ----------------------------------------- | --------------------------- |
| `.simultaneousWithExternalGesture`        | `simultaneousWith:`         |
| `.requireExternalGestureToFail`           | `requireToFail:`            |
| `.blocksExternalGesture`                  | `block:`                    |

### GestureDetector

The `GestureDetector` is a key component of `react-native-gesture-handler`. It supports gestures created either using the hooks API or the builder pattern (but those cannot be mixed, it's either or). Additionally, it allows for the recognition of multiple gestures through gesture composition. `GestureDetector` interacts closely with `Reanimated`.

#### Reusing Gestures

Using the same instance of a gesture across multiple Gesture Detectors may result in undefined behavior.

### Integration with Reanimated

Worklets' Babel plugin is setup in a way that automatically marks callbacks passed to gestures in the configuration chain as worklets. This means that you don't need to add a `'worklet';` directive at the beginning of the functions. Here is an example that will be automatically workletized:

```jsx
const gesture = useTapGesture({
  onBegin: () => {
    console.log(_WORKLET);
  },
});
```

This one will not be workletized because the callback is defined outside of the gesture object:

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

This one will not be workletized as well, due to the Worklet's plugin limitation - the callback cannot be wrapped by any other higher order function to be workletized:

```jsx
const gesture = useTapGesture({
  onBegin: useCallback(() => {
    console.log(_WORKLET);
  }, []),
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

```jsx
const gesture = useTapGesture({
  onBegin: useCallback(() => {
    'worklet';
    console.log(_WORKLET);
  }, []),
});
```

### Using SharedValue in gesture config

RNGH3 allows to pass `SharedValue` to gestures' configurations. This allows to react to configuration changes without unnecessary rerenders. For example:

```js
import * as React from 'react';
import { Animated } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  useTapGesture,
} from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

export default function App() {
  // highlight-next-line
  const taps = useSharedValue(2);

  const gesture = useTapGesture({
    // highlight-next-line
    numberOfTaps: taps,
    onDeactivate: () => {
      taps.value += 1;
    },
  });

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={{
            width: 150,
            height: 150,
            backgroundColor: 'blue',
          }}
        />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
```

### Disabling Reanimated

Gestures created with the hook API have `Reanimated` integration enabled by default (if it's installed), meaning all callbacks are executed on the UI thread. There are two methods available to disable this behavior for a specific gesture.

#### disableReanimated

When `disableReanimated` is set to `true` in the gesture configuration, `Reanimated` integration will be completely turned off for that gesture throughout its entire lifecycle. This setting eliminates all interaction points with `Reanimated`, thereby reducing any potential overhead. Default value for this property is `false`.

This property cannot be changed dynamically during the gesture's lifecycle. If it changes in runtime the application will crash.

```jsx
const gesture = usePanGesture({
  // highlight-next-line
  disableReanimated: true,

  onUpdate: () => {
    console.log('Panning');
  },
});
```

#### runOnJS

The `runOnJS` property allows you to dynamically control whether callbacks are executed on the JS thread or the UI thread. When set to `true`, callbacks will run on the JS thread. Setting it to `false` will execute them on the UI thread. Default value for this property is `false`.

This property can be changed dynamically throughout the gesture's lifecycle.

```jsx
import React from 'react';
import { View } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';

export default function App() {
  // highlight-next-line
  const shouldRunOnJS = useSharedValue(false);

  const panGesture = usePanGesture({
    onUpdate: () => {
      console.log(
        globalThis.__RUNTIME_KIND === 2
          ? 'Running on UI thread'
          : 'Running on JS thread'
      );
    },
    onDeactivate: () => {
      shouldRunOnJS.value = !shouldRunOnJS.value;
    },
    // highlight-next-line
    runOnJS: shouldRunOnJS,
  });

  return (
    <GestureHandlerRootView>
      <View style={{
        backgroundColor: '#b58df1',
        width: 150,
        height: 150,
      }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={{
            width: 100,
            height: 100,
            backgroundColor: 'blue',
          }} />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}
```

### Migrating components relying on view hierarchy

Certain components, such as `SVG`, depend on the view hierarchy to function correctly. In Gesture Handler 3, `GestureDetector` disrupts these hierarchies. To resolve this issue, two new detectors have been introduced: `InterceptingGestureDetector` and `VirtualGestureDetector`.

`InterceptingGestureDetector` functions similarly to the `GestureDetector`, but it can also act as a proxy for `VirtualGestureDetector` within its component subtree. Because it can be used solely to establish the context for virtual detectors, the `gesture` property is optional.

`VirtualGestureDetector` is similar to the `GestureDetector` from RNGH2. Because it is not a host component, it does not interfere with the host view hierarchy. This allows you to attach gestures without disrupting functionality that depends on it.

:::danger Detectors order
`VirtualGestureDetector` has to be a descendant of `InterceptingGestureDetector`.
:::

#### Migrating SVG

In Gesture Handler 2 it was possible to use `GestureDetector` directly on `SVG`. In Gesture Handler 3, the correct way to interact with `SVG` is to use `InterceptingGestureDetector` and `VirtualGestureDetector`.

Old API:
```js
import { GestureDetector } from 'react-native-gesture-handler';

<GestureDetector gesture={containerTap}>
  <Svg>
    <GestureDetector gesture={circleTap}>
      <Circle />
    </GestureDetector>
  </Svg>
</GestureDetector>
```

New API:
```js
import { InterceptingGestureDetector, VirtualGestureDetector } from 'react-native-gesture-handler';

<InterceptingGestureDetector gesture={containerTap}>
  <Svg>
    <VirtualGestureDetector gesture={circleTap}>
      <Circle />
    </VirtualGestureDetector>
  </Svg>
</InterceptingGestureDetector>
```

### Old components

When the code using the component relies on the APIs that are no longer available on the components in Gesture Handler 3 (like `waitFor`, `simultaneousWith`, `blocksHandler`, `onHandlerStateChange`, `onGestureEvent` props), it cannot be easily migrated in isolation. In this case update the imports to the Legacy version of the component, and inform the user that the dependencies need to be migrated first.

If the migration is possible, use the ask questions tool to clarify the user intent unless clearly stated beforehand: should the components be using the new implementation (no `Legacy` prefix when imported), or should they revert to the old implementation (`Legacy` prefix when imported)?

#### Buttons

Don't suggest replacing buttons from Gesture Handler with components from React Native.

The implementation of buttons has been updated, resolving most button-related issues. They have also been internally rewritten to utilize the new hook API. The original button components are still accessible but have been renamed with the prefix `Legacy`, e.g., `RectButton` is now available as `LegacyRectButton`.

Although the legacy JS implementation of the buttons is still available, they also use the new host component internally.

Legacy buttons

| RNGH2                 | RNGH3                       |
| --------------------- | --------------------------- |
| `RawButton`           | `LegacyRawButton`           |
| `BaseButton`          | `LegacyBaseButton`          |
| `RectButton`          | `LegacyRectButton`          |
| `BorderlessButton`    | `LegacyBorderlessButton`    |

#### Other components

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


### Replaced types

Most of the types used in the old API, like `TapGesture`, are still present in Gesture Handler 3. However, they are now used in new hook API. Types for old API now have `Legacy` prefix, e.g. `TapGesture` becomes `LegacyTapGesture`.

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
