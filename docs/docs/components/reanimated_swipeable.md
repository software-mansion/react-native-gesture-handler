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
import Swipeable from "react-native-gesture-handler/Swipeable";
```

## Properties

### `friction`

a number that specifies how much the visual interaction will be delayed compared to the gesture distance. e.g. value of 1 will indicate that the swipeable panel should exactly follow the gesture, 2 means it is going to be two times "slower".

### `leftThreshold`

distance from the left edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.

### `rightThreshold`

distance from the right edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.

### `dragOffsetFromLeftEdge`

distance that the panel must be dragged from the left edge to be considered a swipe. The default value is 10.

### `dragOffsetFromRightEdge`

distance that the panel must be dragged from the right edge to be considered a swipe. The default value is 10.

### `overshootLeft`

a boolean value indicating if the swipeable panel can be pulled further than the left actions panel's width. It is set to `true` by default as long as the left panel render method is present.

### `overshootRight`

a boolean value indicating if the swipeable panel can be pulled further than the right actions panel's width. It is set to `true` by default as long as the right panel render method is present.

### `overshootFriction`

a number that specifies how much the visual interaction will be delayed compared to the gesture distance at overshoot. Default value is 1, it mean no friction, for a native feel, try 8 or above.

### `onSwipeableOpen`

method that is called when action panel gets open (either right or left). Takes swipe direction as
an argument.

### `onSwipeableClose`

method that is called when action panel is closed. Takes swipe direction as
an argument.

### `onSwipeableWillOpen`

method that is called when action panel starts animating on open (either right or left). Takes swipe direction as
an argument.

### `onSwipeableWillClose`

method that is called when action panel starts animating on close. Takes swipe direction as
an argument.

### `renderLeftActions`

method that is expected to return an action panel that is going to be revealed from the left side when user swipes right.
This map describes the values to use as inputRange for extra interpolation:

SharedValue: [startValue, endValue]

progress: [0, 1]

drag: [0, +]

To support `rtl` flexbox layouts use `flexDirection` styling.

### `renderRightActions`

method that is expected to return an action panel that is going to be revealed from the right side when user swipes left.
This map describes the values to use as inputRange for extra interpolation:

SharedValue: [startValue, endValue]

progress: [0, 1]

drag: [0, -]

To support `rtl` flexbox layouts use `flexDirection` styling.

### `containerStyle`

style object for the container (Animated.View), for example to override `overflow: 'hidden'`.

### `childrenContainerStyle`

style object for the children container (Animated.View), for example to apply `flex: 1`.

### `enableTrackpadTwoFingerGesture` (iOS only)

Enables two-finger gestures on supported devices, for example iPads with trackpads. If not enabled the gesture will require click + drag, with enableTrackpadTwoFingerGesture swiping with two fingers will also trigger the gesture.

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

method that closes component.

### `openLeft`

method that opens component on left side.

### `openRight`

method that opens component on right side.

### `reset`

method that resets the swiping states of this `Swipeable` component.

Unlike method `close`, this method does not trigger any animation.

### Example:

See the [swipeable example](https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx) from GestureHandler Example App.

```jsx
import React, { Component } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from "react-native-gesture-handler/Swipeable";

const LeftAction = ({ dragX, swipeableRef }: LeftActionsProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          dragX.value,
          [0, 50, 100, 101],
          [-20, 0, 0, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));
  return (
    <RectButton
      style={{
        flex: 1,
        backgroundColor: '#497AFC',
        justifyContent: 'center',
      }}
      onPress={() => swipeableRef.current!.close()}>
      <Animated.Text>
        Archive
      </Animated.Text>
    </RectButton>
  );
};

const renderLeftActions = (
  _progress: any,
  translation: SharedValue<number>,
  swipeableRef: React.RefObject<SwipeableMethods>
) => <LeftAction dragX={translation} swipeableRef={swipeableRef} />;

function AppleStyleSwipeableRow({ children }: AppleStyleSwipeableRowProps) {
  const swipeableRow = useRef<SwipeableMethods>(null);

  return (
    <Swipeable
      ref={swipeableRow}
      friction={2}
      enableTrackpadTwoFingerGesture
      leftThreshold={30}
      renderLeftActions={(_, progress) =>
        renderLeftActions(_, progress, swipeableRow)
      }>
      <Text>Apple style swipeable</Text>
    </Swipeable>
  );
}
```
