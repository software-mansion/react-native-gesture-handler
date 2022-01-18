---
id: pan-gesture
title: Pan gesture
sidebar_label: Pan gesture
---

import BaseEventData from './base-gesture-event-data.md';
import BaseEventConfig from './base-gesture-config.md';
import BaseContinousEventConfig from './base-continous-gesture-config.md';
import BaseEventCallbacks from './base-gesture-callbacks.md';
import BaseContinousEventCallbacks from './base-continous-gesture-callbacks.md';

A continuous gesture that can recognize a panning (dragging) gesture and track its movement.

The gesture [activates](../../under-the-hood/states-events.md#active) when a finger is placed on the screen and moved some initial distance.

Configurations such as a minimum initial distance, specific vertical or horizontal pan detection and [number of fingers](#minPointers) required for activation (allowing for multifinger swipes) may be specified.

Gesture callback can be used for continuous tracking of the pan gesture. It provides information about the gesture such as its XY translation from the starting point as well as its instantaneous velocity.

## Multi touch pan handling

If your app relies on multi touch pan handling this section provides some information how the default behavior differs between the platform and how (if necessary) it can be unified.

The difference in multi touch pan handling lies in the way how translation properties during the event are being calculated.
On iOS the default behavior when more than one finger is placed on the screen is to treat this situation as if only one pointer was placed in the center of mass (average position of all the pointers).
This applies also to many platform native components that handle touch even if not primarily interested in multi touch interactions like for example UIScrollView component.

The default behavior for native components like scroll view, pager views or drawers is different and hence gesture defaults to that when it comes to pan handling.
The difference is that instead of treating the center of mass of all the fingers placed as a leading pointer it takes the latest placed finger as such.
This behavior can be changed on Android using [`avgTouches`](#avgtouches-android-only) flag.

Note that on both Android and iOS when the additional finger is placed on the screen that translation prop is not affected even though the position of the pointer being tracked might have changed.
Therefore it is safe to rely on translation most of the time as it only reflects the movement that happens regardless of how many fingers are placed on the screen and if that number changes over time.
If you wish to track the "center of mass" virtual pointer and account for its changes when the number of finger changes you can use relative or absolute position provided in the event ([`x`](#x) and [`y`](#y) or [`absoluteX`](#absolutex) and [`absoluteY`](#absolutey)).

## Config

### Properties specific to `PanGesture`:

### `minDistance(value: number)`

Minimum distance the finger (or multiple finger) need to travel before the gesture [activates](../../under-the-hood/states-events.md#active). Expressed in points.

### `minPointers(value: number)`

A number of fingers that is required to be placed before gesture can [activate](../../under-the-hood/states-events.md#active). Should be a higher or equal to 0 integer.

### `maxPointers(value: number)`

When the given number of fingers is placed on the screen and gesture hasn't yet [activated](../../under-the-hood/states-events.md#active) it will fail recognizing the gesture. Should be a higher or equal to 0 integer.

### `activeOffsetX(value: number | number[])`

Range along X axis (in points) where fingers travels without activation of gesture. Moving outside of this range implies activation of gesture. Range can be given as an array or a single number.
If range is set as an array, first value must be lower or equal to 0, a the second one higher or equal to 0.
If only one number `p` is given a range of `(-inf, p)` will be used if `p` is higher or equal to 0 and `(-p, inf)` otherwise.

### `activeOffsetY(value: number | number[])`

Range along Y axis (in points) where fingers travels without activation of gesture. Moving outside of this range implies activation of gesture. Range can be given as an array or a single number.
If range is set as an array, first value must be lower or equal to 0, a the second one higher or equal to 0.
If only one number `p` is given a range of `(-inf, p)` will be used if `p` is higher or equal to 0 and `(-p, inf)` otherwise.

### `failOffsetY(value: number | number[])`

When the finger moves outside this range (in points) along Y axis and gesture hasn't yet activated it will fail recognizing the gesture. Range can be given as an array or a single number.
If range is set as an array, first value must be lower or equal to 0, a the second one higher or equal to 0.
If only one number `p` is given a range of `(-inf, p)` will be used if `p` is higher or equal to 0 and `(-p, inf)` otherwise.

### `failOffsetX(value: number | number[])`

When the finger moves outside this range (in points) along X axis and gesture hasn't yet activated it will fail recognizing the gesture. Range can be given as an array or a single number.
If range is set as an array, first value must be lower or equal to 0, a the second one higher or equal to 0.
If only one number `p` is given a range of `(-inf, p)` will be used if `p` is higher or equal to 0 and `(-p, inf)` otherwise.

### `averageTouches(value: boolean)` (Android only)

### `enableTrackpadTwoFingerGesture(value: boolean)` (iOS only)

Enables two-finger gestures on supported devices, for example iPads with trackpads. If not enabled the gesture will require click + drag, with enableTrackpadTwoFingerGesture swiping with two fingers will also trigger the gesture.

<BaseEventConfig />
<BaseContinousEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinousEventCallbacks />

## Event data

### Event attributes specific to `PanGesture`:

### `translationX`

Translation of the pan gesture along X axis accumulated over the time of the gesture. The value is expressed in the point units.

### `translationY`

Translation of the pan gesture along Y axis accumulated over the time of the gesture. The value is expressed in the point units.

### `velocityX`

Velocity of the pan gesture along the X axis in the current moment. The value is expressed in point units per second.

### `velocityY`

Velocity of the pan gesture along the Y axis in the current moment. The value is expressed in point units per second.

### `x`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `y`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](./gesture-detector.md). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

<BaseEventData />

## Example

```jsx
const END_POSITION = 200;
const onLeft = useSharedValue(true);
const position = useSharedValue(0);

const panGesture = Gesture.Pan()
  .onUpdate((e) => {
    if (onLeft.value) {
      position.value = e.translationX;
    } else {
      position.value = END_POSITION + e.translationX;
    }
  })
  .onEnd((e) => {
    if (position.value > END_POSITION / 2) {
      position.value = withTiming(END_POSITION, { duration: 100 });
      onLeft.value = false;
    } else {
      position.value = withTiming(0, { duration: 100 });
      onLeft.value = true;
    }
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: position.value }],
}));

return (
  <GestureDetector gesture={panGesture}>
    <Animated.View style={[styles.box, animatedStyle]} />
  </GestureDetector>
);
```
