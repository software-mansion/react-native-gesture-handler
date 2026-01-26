---
id: pan-gesture
title: Pan gesture
sidebar_label: Pan gesture
sidebar_position: 3
---

import { vanishOnMobile, appearOnMobile, webContainer } from '@site/src/utils/getGestureStyles';

import useBaseUrl from '@docusaurus/useBaseUrl';

import PanGestureBasic from '@site/static/examples/PanGestureBasic';
import PanGestureBasicSrc from '!!raw-loader!@site/static/examples/PanGestureBasicSrc';

<div className={webContainer}>
  <div className={vanishOnMobile} style={{ display: 'flex', justifyContent: 'center', maxWidth: 360 }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/pan.mp4")} type="video/mp4"/>
    </video>
  </div>
  <InteractiveExample
    component={<PanGestureBasic/>}
    src={PanGestureBasicSrc}
    disableMarginBottom={true}
  />
</div>

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseContinuousEventConfig from './\_shared/base-continuous-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinuousEventCallbacks from './\_shared/base-continuous-gesture-callbacks.md';

A continuous gesture that can recognize a panning (dragging) gesture and track its movement.

The gesture [activates](/docs/2.x/fundamentals/states-events#active) when a finger is placed on the screen and moved some initial distance.

Configurations such as a minimum initial distance, specific vertical or horizontal pan detection and [number of fingers](/docs/2.x/gestures/pan-gesture#minpointersvalue-number) required for activation (allowing for multifinger swipes) may be specified.

Gesture callback can be used for continuous tracking of the pan gesture. It provides information about the gesture such as its XY translation from the starting point as well as its instantaneous velocity.

  <div className={appearOnMobile} style={{ display: 'flex', margin: '16px 0', justifyContent: 'center' }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/pan.mp4")} type="video/mp4"/>
    </video>
  </div>

<samp id="PanGestureBasicSrc">Pan Gesture</samp>

## Example

```jsx
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

const END_POSITION = 200;

export default function App() {
  const onLeft = useSharedValue(true);
  const position = useSharedValue(0);

  // highlight-next-line
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
    // highlight-next-line
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 120,
    width: 120,
    backgroundColor: '#b58df1',
    borderRadius: 20,
    marginBottom: 30,
  },
});
```

## Multi touch pan handling

If your app relies on multi touch pan handling this section provides some information how the default behavior differs between the platform and how (if necessary) it can be unified.

The difference in multi touch pan handling lies in the way how translation properties during the event are being calculated.
On iOS the default behavior when more than one finger is placed on the screen is to treat this situation as if only one pointer was placed in the center of mass (average position of all the pointers).
This applies also to many platform native components that handle touch even if not primarily interested in multi touch interactions like for example UIScrollView component.

On Android, the default behavior for native components like scroll view, pager views or drawers is different and hence gesture defaults to that when it comes to pan handling.
The difference is that instead of treating the center of mass of all the fingers placed as a leading pointer it takes the latest placed finger as such.
This behavior can be changed on Android using [`averageTouches`](#averagetouchesvalue-boolean-android-only) flag.

Note that on both Android and iOS when the additional finger is placed on the screen that translation prop is not affected even though the position of the pointer being tracked might have changed.
Therefore it is safe to rely on translation most of the time as it only reflects the movement that happens regardless of how many fingers are placed on the screen and if that number changes over time.
If you wish to track the "center of mass" virtual pointer and account for its changes when the number of finger changes you can use relative or absolute position provided in the event ([`x`](#x) and [`y`](#y) or [`absoluteX`](#absolutex) and [`absoluteY`](#absolutey)).

## Config

### Properties specific to `PanGesture`:

### `minDistance(value: number)`

Minimum distance the finger (or multiple finger) need to travel before the gesture [activates](/docs/2.x/fundamentals/states-events#active). Expressed in points.

### `minPointers(value: number)`

A number of fingers that is required to be placed before gesture can [activate](/docs/2.x/fundamentals/states-events#active). Should be a higher or equal to 0 integer.

### `maxPointers(value: number)`

When the given number of fingers is placed on the screen and gesture hasn't yet [activated](/docs/2.x/fundamentals/states-events#active) it will fail recognizing the gesture. Should be a higher or equal to 0 integer.

### `activateAfterLongPress(duration: number)`

Duration in milliseconds of the `LongPress` gesture before `Pan` is allowed to [activate](/docs/2.x/fundamentals/states-events#active). If the finger is moved during that period, the gesture will [fail](/docs/2.x/fundamentals/states-events#failed). Should be a higher or equal to 0 integer. Default value is 0, meaning no `LongPress` is required to [activate](/docs/2.x/fundamentals/states-events#active) the `Pan`.

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

Android, by default, will calculate translation values based on the position of the leading pointer (the first one that was placed on the screen). This modifier allows that behavior to be changed to the one that is default on iOS - the averaged position of all active pointers will be used to calculate the translation values.

### `enableTrackpadTwoFingerGesture(value: boolean)` (iOS only)

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

<BaseEventConfig />
<BaseContinuousEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinuousEventCallbacks />

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

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector). Expressed in point units.

### `y`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](/docs/2.x/gestures/gesture-detector). Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

### `stylusData`

Object that contains additional information about `stylus`. It consists of the following fields:

- [`tiltX`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX) - angle in degrees between the Y-Z plane of the stylus and the screen.
- [`tiltY`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY) - angle in degrees between the X-Z plane of the stylus and the screen.
- [`altitudeAngle`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/altitudeAngle) - angle between stylus axis and the X-Y plane of a device screen.
- [`azimuthAngle`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/azimuthAngle) - angle between the Y-Z plane and the plane containing both the stylus axis and the Y axis.
- [`pressure`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure) - indicates the normalized pressure of the stylus.

<BaseEventData />
