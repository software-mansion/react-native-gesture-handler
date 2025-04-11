---
id: swipeable
title: Swipeable
sidebar_label: Swipeable
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import GifGallery from '@site/components/GifGallery'

<GifGallery>
  <img src={useBaseUrl("gifs/sampleswipeable.gif")} height="120" />
</GifGallery>

:::caution
This component is deprecated.
Please use [the reanimated version](/react-native-gesture-handler/docs/components/reanimated_swipeable).
:::

This component allows for implementing swipeable rows or similar interaction. It renders its children within a panable container allows for horizontal swiping left and right. While swiping one of two "action" containers can be shown depends on whether user swipes left or right (containers can be rendered by `renderLeftActions` or `renderRightActions` props).

### Usage:

Similarly to the `DrawerLayout`, `Swipeable` component isn't exported by default from the `react-native-gesture-handler` package. To use it, import it in the following way:

```js
import Swipeable from 'react-native-gesture-handler/Swipeable';
```

## Properties

### `friction`

A number that specifies how much the visual interaction will be delayed compared to the gesture distance. e.g. value of `1` will indicate that the swipeable panel should exactly follow the gesture, `2` means it is going to be two times "slower".

### `leftThreshold`

Distance from the left edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.

### `rightThreshold`

Distance from the right edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.

### `dragOffsetFromLeftEdge`

Distance that the panel must be dragged from the left edge to be considered a swipe. The default value is `10`.

### `dragOffsetFromRightEdge`

Distance that the panel must be dragged from the right edge to be considered a swipe. The default value is `10`.

### `overshootLeft`

A boolean value indicating if the swipeable panel can be pulled further than the left actions panel's width. It is set to `true` by default as long as the left panel render method is present.

### `overshootRight`

A boolean value indicating if the swipeable panel can be pulled further than the right actions panel's width. It is set to `true` by default as long as the right panel render method is present.

### `overshootFriction`

A number that specifies how much the visual interaction will be delayed compared to the gesture distance at overshoot. Default value is `1`, it mean no friction, for a native feel, try `8` or above.

### `onSwipeableLeftOpen`

:::caution
This callback is deprecated and will be removed in the next version. Please use `onSwipeableOpen(direction)`
:::

Method that is called when left action panel gets open.

### `onSwipeableRightOpen`

:::caution
This callback is deprecated and will be removed in the next version. Please use `onSwipeableOpen(direction)`
:::

Method that is called when right action panel gets open.

### `onSwipeableOpen`

Method that is called when action panel gets open (either right or left). Takes swipe direction as
an argument.

### `onSwipeableClose`

Method that is called when action panel is closed. Takes swipe direction as
an argument.

### `onSwipeableLeftWillOpen`

:::caution
This callback is deprecated and will be removed in the next version. Please use `onSwipeableWillOpen(direction)`
:::

Method that is called when left action panel starts animating on open.

### `onSwipeableRightWillOpen`

:::caution
This callback is deprecated and will be removed in the next version. Please use `onSwipeableWillOpen(direction)`
:::

Method that is called when right action panel starts animating on open.

### `onSwipeableWillOpen`

Method that is called when action panel starts animating on open (either right or left). Takes swipe direction as
an argument.

### `onSwipeableWillClose`

Method that is called when action panel starts animating on close. Takes swipe direction as
an argument.

### `renderLeftActions`

Method that is expected to return an action panel that is going to be revealed from the left side when user swipes right.
This map describes the values to use as inputRange for extra interpolation:
AnimatedValue: [startValue, endValue]

progressAnimatedValue: `[0, 1]`
dragAnimatedValue: `[0, +]`

To support `rtl` flexbox layouts use `flexDirection` styling.

### `renderRightActions`

Method that is expected to return an action panel that is going to be revealed from the right side when user swipes left.
This map describes the values to use as inputRange for extra interpolation:
AnimatedValue: [startValue, endValue]

progressAnimatedValue: `[0, 1]`
dragAnimatedValue: `[0, -]`

To support `rtl` flexbox layouts use `flexDirection` styling.

### `containerStyle`

Style object for the container (Animated.View), for example to override `overflow: 'hidden'`.

### `childrenContainerStyle`

Style object for the children container (Animated.View), for example to apply `flex: 1`.

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

Method that closes component.

### `openLeft`

Method that opens component on left side.

### `openRight`

Method that opens component on right side.

### `reset`

Method that resets the swiping states of this `Swipeable` component.

Unlike method `close`, this method does not trigger any animation.

### Example:

See the [swipeable example](https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/showcase/swipeable/index.tsx) from GestureHandler Example App or view it directly on your phone by visiting [our expo demo](https://snack.expo.io/@adamgrzybowski/react-native-gesture-handler-demo).

```js
import React, { Component } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

class AppleStyleSwipeableRow extends Component {
  renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <RectButton style={styles.leftAction} onPress={this.close}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          Archive
        </Animated.Text>
      </RectButton>
    );
  };
  render() {
    return (
      <Swipeable renderLeftActions={this.renderLeftActions}>
        <Text>"hello"</Text>
      </Swipeable>
    );
  }
}
```
