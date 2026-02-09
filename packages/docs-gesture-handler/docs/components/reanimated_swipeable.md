---
id: reanimated_swipeable
title: Reanimated Swipeable
sidebar_label: Reanimated Swipeable
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import GifGallery from '@site/components/GifGallery'

<GifGallery>
  <img src={useBaseUrl("gifs/sampleswipeable.gif")} height="120" />
</GifGallery>

:::info
This component is a drop-in replacement for the `Swipeable` component, rewritten using `Reanimated`.
:::

Reanimated `Swipeable` allows for implementing swipeable rows or similar interaction. It renders its children within a panable container allows for horizontal swiping left and right. While swiping one of two "action" containers can be shown depends on whether user swipes left or right (containers can be rendered by `renderLeftActions` or `renderRightActions` props).

### Usage:

To use it, import it in the following way:

```js
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
```

## Properties

### `friction`

a number that specifies how much the visual interaction will be delayed compared to the gesture distance.
e.g. value of `1` will indicate that the swipeable panel should exactly follow the gesture, `2` means it is going to be two times "slower".

### `leftThreshold`

distance from the left edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.

### `rightThreshold`

distance from the right edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.

### `dragOffsetFromLeftEdge`

distance that the panel must be dragged from the left edge to be considered a swipe. The default value is `10`.

### `dragOffsetFromRightEdge`

distance that the panel must be dragged from the right edge to be considered a swipe. The default value is `10`.

### `overshootLeft`

a boolean value indicating if the swipeable panel can be pulled further than the left actions panel's width. It is set to `true` by default as long as the left panel render function is present.

### `overshootRight`

a boolean value indicating if the swipeable panel can be pulled further than the right actions panel's width. It is set to `true` by default as long as the right panel render function is present.

### `overshootFriction`

a number that specifies how much the visual interaction will be delayed compared to the gesture distance at overshoot. Default value is `1`, it mean no friction, for a native feel, try `8` or above.

### `onSwipeableOpen`

a function that is called when `swipeable` is opened (either right or left).
Receives swipe direction as an argument.

### `onSwipeableClose`

a function that is called when `swipeable` is closed.
Receives swipe direction as an argument.

### `onSwipeableWillOpen`

a function that is called when `swipeable` starts animating on open (either right or left).
Receives swipe direction as an argument.

### `onSwipeableWillClose`

a function that is called when `swipeable` starts animating on close.
Receives swipe direction as an argument.

### `onSwipeableOpenStartDrag`

a function that is called when a user starts to drag the `swipable` to open.
Receives swipe direction as an argument.

### `onSwipeableCloseStartDrag`

a function that is called when a user starts to drag the `swipable` to close.
Receives swipe direction as an argument.

### `renderLeftActions`

a function that returns a component which will be rendered under the swipeable after swiping it to the right.
The function receives the following arguments:

- `progress` - a `SharedValue` representing swiping progress relative to the width of the returned element.
  - Equals `0` when `swipeable` is closed, `1` when `swipeable` is opened.
  - When the element overshoots it's opened position the value tends towards `Infinity`.
- `translation` - a horizontal offset of the `swipeable` relative to its closed position.
- `swipeableMethods` - provides an object exposing the methods listed [here](#methods).

This function must return a `ReactNode`.

To support `rtl` flexbox layouts use `flexDirection` styling.

### `renderRightActions`

a function that returns a component which will be rendered under the swipeable after swiping it to the left.
The function receives the following arguments:

- `progress` - a `SharedValue` representing swiping progress relative to the width of the returned element.
  - Equals `0` when `swipeable` is closed, `1` when `swipeable` is opened.
  - When the element overshoots it's opened position the value tends towards `Infinity`.
- `translation` - a horizontal offset of the `swipeable` relative to its closed position.
- `swipeableMethods` - provides an object exposing the methods listed [here](#methods).

This function must return a `ReactNode`.

To support `rtl` flexbox layouts use `flexDirection` styling.

### `containerStyle`

style object for the container (`Animated.View`), for example to override `overflow: 'hidden'`.

### `childrenContainerStyle`

style object for the children container (`Animated.View`), for example to apply `flex: 1`.

### `simultaneousWithExternalGesture`

A gesture configuration to be recognized simultaneously with the swipeable gesture. This is useful for allowing other gestures to work simultaneously with swipeable gesture handler.

For example, to enable a pan gesture alongside the swipeable gesture:

```jsx
const panGesture = Gesture.Pan();

<GestureDetector gesture={panGesture}>
  <ReanimatedSwipeable simultaneousWithExternalGesture={panGesture} />
</GestureDetector>;
```

More details can be found in the [gesture composition documentation](/docs/fundamentals/gesture-composition#simultaneouswith).

### `enableTrackpadTwoFingerGesture` (iOS only)

Enables two-finger gestures on supported devices, for example iPads with trackpads.
If not enabled the gesture will require click + drag, with `enableTrackpadTwoFingerGesture` swiping with two fingers will also trigger the gesture.

### `mouseButton(value: MouseButton)` (Web & Android only)

Allows users to choose which mouse button should handler respond to. The enum `MouseButton` consists of the following predefined fields:

- `LEFT`
- `RIGHT`
- `MIDDLE`
- `BUTTON_4`
- `BUTTON_5`
- `ALL`

Arguments can be combined using `|` operator, e.g. `mouseButton(MouseButton.LEFT | MouseButton.RIGHT)`. Default value is set to `MouseButton.LEFT`.

### `enableContextMenu(value: boolean)` (Web only)

Specifies whether context menu should be enabled after clicking on underlying view with right mouse button. Default value is set to `false`.

## Methods

Using reference to `Swipeable` it's possible to trigger some actions on it

### `close`

a method that closes component.

### `openLeft`

a method that opens component on left side.

### `openRight`

a method that opens component on right side.

### `reset`

a method that resets the swiping states of this `Swipeable` component.

Unlike method `close`, this method does not trigger any animation.

### Example:

For a more in-depth presentation of differences between the new and the legacy implementations,
see [swipeable example](https://github.com/software-mansion/react-native-gesture-handler/blob/main/apps/common-app/src/release_tests/swipeableReanimation/index.tsx) from GestureHandler Example App.

```jsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    console.log('showRightProgress:', prog.value);
    console.log('appliedTranslation:', drag.value);

    return {
      transform: [{ translateX: drag.value + 50 }],
    };
  });

  return (
    <Reanimated.View style={styleAnimation}>
      <Text style={styles.rightAction}>Text</Text>
    </Reanimated.View>
  );
}

export default function Example() {
  return (
    <GestureHandlerRootView>
      <ReanimatedSwipeable
        containerStyle={styles.swipeable}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction}>
        <Text>Swipe me!</Text>
      </ReanimatedSwipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  rightAction: { width: 50, height: 50, backgroundColor: 'purple' },
  separator: {
    width: '100%',
    borderTopWidth: 1,
  },
  swipeable: {
    height: 50,
    backgroundColor: 'papayawhip',
    alignItems: 'center',
  },
});
```
