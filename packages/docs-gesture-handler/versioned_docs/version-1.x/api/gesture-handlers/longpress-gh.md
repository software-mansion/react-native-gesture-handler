---
id: longpress-gh
title: LongPressGestureHandler
sidebar_label: Long press
---

A discrete gesture handler that activates when the corresponding view is pressed for a sufficiently long time.
This handler's state will turn into [END](/docs/under-the-hood/state#end) immediately after the finger is released.
The handler will fail to recognize a touch event if the finger is lifted before the [minimum required time](#mindurationms) or if the finger is moved further than the [allowable distance](#maxdist).

The handler is implemented using [UILongPressGestureRecognizer](https://developer.apple.com/documentation/uikit/uilongpressgesturerecognizer) on iOS and [LongPressGestureHandler](https://github.com/software-mansion/react-native-gesture-handler/blob/main/android/lib/src/main/java/com/swmansion/gesturehandler/LongPressGestureHandler.kt) on Android.

## Properties

See [set of properties inherited from base handler class](common-gh#properties). Below is a list of properties specific to the `LongPressGestureHandler` component:

### `minDurationMs`

Minimum time, expressed in milliseconds, that a finger must remain pressed on the corresponding view. The default value is 500.

### `maxDist`

Maximum distance, expressed in points, that defines how far the finger is allowed to travel during a long press gesture. If the finger travels further than the defined distance and the handler hasn't yet [activated](/docs/under-the-hood/state#active), it will fail to recognize the gesture. The default value is 10.

## Event data

See [set of event attributes from base handler class](common-gh#event-data). Below is a list of gesture event attributes specific to the `LongPressGestureHandler` component:

### `x`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the handler.

### `y`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the handler.

### `absoluteX`

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. It is recommended to use `absoluteX` instead of [`x`](#x) in cases when the view attached to the handler can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. It is recommended to use `absoluteY` instead of [`y`](#y) in cases when the view attached to the handler can be transformed as an effect of the gesture.

### `duration`

Duration of the long press (time since the start of the event), expressed in milliseconds.

## Example

See the [multitap example](https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/basic/multitap/index.tsx) from [GestureHandler Example App](example.md) or view it directly on your phone by visiting [our expo demo](https://snack.expo.io/@adamgrzybowski/react-native-gesture-handler-demo).

```js
const LongPressButton = () => (
  <LongPressGestureHandler
    onHandlerStateChange={({ nativeEvent }) => {
      if (nativeEvent.state === State.ACTIVE) {
        Alert.alert("I'm being pressed for so long");
      }
    }}
    minDurationMs={800}>
    <View style={styles.box} />
  </LongPressGestureHandler>
);
```
