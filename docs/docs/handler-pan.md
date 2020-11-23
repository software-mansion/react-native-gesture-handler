---
id: handler-pan
title: PanGestureHandler
sidebar_label: PanGestureHandler
---

A continuous gesture handler that recognizes panning (dragging) gesture and allows for tracking their movement.

The handler [activates](state.md#active) when finger is placed on the screen and moved by some initial distance. The distance can be configured and allow for detecting only vertical or horizontal pan. Also the number of fingers required for the handler to [activates](state.md#active) can be [configured](#minPointers), which allows for detecting multifinger swipes.

Gesture callback can be used for continuous tracking of the pan gesture. It provides information about the translation from the start of the gesture as well as tracks the velocity.

The handler is implemented using [UIPanGestureRecognizer](https://developer.apple.com/documentation/uikit/uipangesturerecognizer) on iOS and [PanGestureHandler](https://github.com/software-mansion/react-native-gesture-handler/blob/master/android/lib/src/main/java/com/swmansion/gesturehandler/PanGestureHandler.java) on Android.

## Custom activation criteria

Component `PanGestureHandler` exposes a number of properties that allows for customizing the criteria under which the handler will [activate](state.md#active) or [fail](state.md#fail) recognizing.

When more than one of such a property is set pan handler expects all the criteria to be met for recognizing and at most one of the criteria to be overstepped to fail recognition.
For example when both [`minDeltaX`](#mindeltax) and [`minDeltaY`](#mindeltay) are set to 20 we expect the finger to travel by 20 points in both X and Y axis before the handler activates.
Another example would be to have both [`maxDeltaX`](#maxdeltaX) and [`maxDeltaY`](#maxdeltay) set to 20 and [`minDist`](#mindist) set to 23.
In such a case when we move finger along X axis by 20 points and 0 points along Y axis the handler will fail even though we are still within the limit with the translation along Y axis.

## Multi touch pan handling

If your app relies on multi touch pan handling this section provides some information how the default behavior differs between the platform and how (if necessary) it can be unified.

The difference in multi touch pan handling lies in the way how translation properties during the event are being calculated.
On iOS the default behavior when more than one figer is placed on the screen is to treat this situation as if only one pointer was placed in the center of mass (average position of all the pointers).
This applies also to many platform native components that handle touch even if not primarily interested in multi touch interactions like for example UIScrollView component.

The default behavior for native components like scroll view, pager views or drawers is different and hence gesture handler defaults to that when it comes to pan handling.
The difference is that instead of treating the center of mass of all the fingers placed as a leading pointer it takes the latest placed finger as such.
This behavior can be changed on Android using [`avgTouches`](#avgtouches-android-only) flag.

Note that on both Android and iOS when the additional finger is placed on the screen that translation prop is not affected even though the position of the pointer being tracked might have changed.
Therefore it is safe to rely on translation most of the time as it only reflects the movement that happens regardless of how many fingers are placed on the screen and if that number changes over time.
If you wish to track the "center of mass" virtual pointer and account for its changes when the number of finger changes you can use relative or absolute position provided in the event ([`x`](#x) and [`y`](#y) or [`absoluteX`](#absolutex) and [`absoluteY`](#absolutey)).

## Properties

See [set of properties inherited from base handler class](handler-common.md#properties). Below is a list of properties specific to `PanGestureHandler` component:

### `minDist`

Minimum distance the finger (or multiple finger) need to travel before the handler [activates](state.md#active). Expressed in points.

### `minPointers`

A number of fingers that is required to be placed before handler can [activate](state.md#active). Should be a higher or equal to 0 integer.

### `maxPointers`

When the given number of fingers is placed on the screen and handler hasn't yet [activated](state.md#active) it will fail recognizing the gesture. Should be a higher or equal to 0 integer.

### `activeOffsetX`

Range along X axis (in points) where fingers travels without activation of handler. Moving outside of this range implies activation of handler. Range can be given as an array or a single number.
If range is set as an array, first value must be lower or equal to 0, a the second one higher or equal to 0.
If only one number `p` is given a range of `(-inf, p)` will be used if `p` is higher or equal to 0 and `(-p, inf)` otherwise.

### `activeOffsetY`

Range along Y axis (in points) where fingers travels without activation of handler. Moving outside of this range implies activation of handler. Range can be given as an array or a single number.
If range is set as an array, first value must be lower or equal to 0, a the second one higher or equal to 0.
If only one number `p` is given a range of `(-inf, p)` will be used if `p` is higher or equal to 0 and `(-p, inf)` otherwise.

### `failOffsetY`

When the finger moves outside this range (in points) along Y axis and handler hasn't yet activated it will fail recognizing the gesture. Range can be given as an array or a single number.
If range is set as an array, first value must be lower or equal to 0, a the second one higher or equal to 0.
If only one number `p` is given a range of `(-inf, p)` will be used if `p` is higher or equal to 0 and `(-p, inf)` otherwise.

### `failOffsetX`

When the finger moves outside this range (in points) along X axis and handler hasn't yet activated it will fail recognizing the gesture. Range can be given as an array or a single number.
If range is set as an array, first value must be lower or equal to 0, a the second one higher or equal to 0.
If only one number `p` is given a range of `(-inf, p)` will be used if `p` is higher or equal to 0 and `(-p, inf)` otherwise.

### `maxDeltaX`

> This method is deprecated but supported for backward compatibility. Instead of using `maxDeltaX={N}` you can do `failOffsetX={[-N, N]}`.

When the finger travels the given distance expressed in points along X axis and handler hasn't yet [activated](state.md#active) it will fail recognizing the gesture.

### `maxDeltaY`

> This method is deprecated but supported for backward compatibility. Instead of using `maxDeltaY={N}` you can do `failOffsetY={[-N, N]}`.

When the finger travels the given distance expressed in points along Y axis and handler hasn't yet [activated](state.md#active) it will fail recognizing the gesture.

### `minOffsetX`

> This method is deprecated but supported for backward compatibility. Instead of using `minOffsetX={N}` you can do `activeOffsetX={N}`.

Minimum distance along X (in points) axis the finger (or multiple finger) need to travel before the handler [activates](state.md#active). If set to a lower or equal to 0 value we expect the finger to travel "left" by the given distance. When set to a higher or equal to 0 number the handler will activate on a movement to the "right". If you wish for the movement direction to be ignored use [`minDeltaX`](#mindeltax) instead.

### `minOffsetY`

> This method is deprecated but supported for backward compatibility. Instead of using `minOffsetY={N}` you can do `activeOffsetY={N}`.

Minimum distance along Y (in points) axis the finger (or multiple finger) need to travel before the handler [activates](state.md#active). If set to a lower or equal to 0 value we expect the finger to travel "up" by the given distance. When set to a higher or equal to 0 number the handler will activate on a movement to the "bottom". If you wish for the movement direction to be ignored use [`minDeltaY`](#mindeltay) instead.

### `minDeltaX`

> This method is deprecated but supported for backward compatibility. Instead of using `minDeltaX={N}` you can do `activeOffsetX={[-N, N]}`.

Minimum distance along X (in points) axis the finger (or multiple finger) need to travel (left or right) before the handler [activates](state.md#active). Unlike [`minoffsetx`](#minoffsetx) this parameter accepts only non-lower or equal to 0 numbers that represents the distance in point units. If you want for the handler to [activate](state.md#active) for the movement in one particular direction use [`minOffsetX`](#minoffsetx) instead.

### `minDeltaY`

> This method is deprecated but supported for backward compatibility. Instead of using `minDeltaY={N}` you can do `activeOffsetY={[-N, N]}`.

Minimum distance along Y (in points) axis the finger (or multiple finger) need to travel (top or bottom) before the handler [activates](state.md#active). Unlike [`minOffsetY`](#minoffsety) this parameter accepts only non-lower or equal to 0 numbers that represents the distance in point units. If you want for the handler to [activate](state.md#active) for the movement in one particular direction use [`minOffsetY`](#minoffsety) instead.

### `avgTouches` (Android only)

### `enableTrackpadTwoFingerGesture` (iOS only)

Enables two-finger gestures on supported devices, for example iPads with trackpads. If not enabled the gesture will require click + drag, with enableTrackpadTwoFingerGesture swiping with two fingers will also trigger the gesture.

## Event data

See [set of event attributes from base handler class](handler-common.md#event-data). Below is a list of gesture event attributes specific to `PanGestureHandler`:

### `translationX`

Translation of the pan gesture along X axis accumulated over the time of the gesture. The value is expressed in the point units.

### `translationY`

Translation of the pan gesture along Y axis accumulated over the time of the gesture. The value is expressed in the point units.

### `velocityX`

Velocity of the pan gesture along the X axis in the current moment. The value is expressed in point units per second.

### `velocityY`

Velocity of the pan gesture along the Y axis in the current moment. The value is expressed in point units per second.

### `x`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the handler. Expressed in point units.

### `y`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the handler. Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

## Example

See the [draggable example](https://github.com/software-mansion/react-native-gesture-handler/blob/master/examples/Example/draggable/index.js) from [GestureHandler Example App](example.md) or view it directly on your phone by visiting [our expo demo](https://snack.expo.io/@adamgrzybowski/react-native-gesture-handler-demo).

```js
const circleRadius = 30;
class Circle extends Component {
  _touchX = new Animated.Value(windowWidth / 2 - circleRadius);
  _onPanGestureEvent = Animated.event([{ nativeEvent: { x: this._touchX } }], {
    useNativeDriver: true,
  });
  render() {
    return (
      <PanGestureHandler onGestureEvent={this._onPanGestureEvent}>
        <Animated.View
          style={{
            height: 150,
            justifyContent: 'center',
          }}>
          <Animated.View
            style={[
              {
                backgroundColor: '#42a5f5',
                borderRadius: circleRadius,
                height: circleRadius * 2,
                width: circleRadius * 2,
              },
              {
                transform: [
                  {
                    translateX: Animated.add(
                      this._touchX,
                      new Animated.Value(-circleRadius)
                    ),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
      </PanGestureHandler>
    );
  }
}
```
