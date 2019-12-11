---
id: handler-longpress
title: LongPressGestureHandler
sidebar_label: LongPressGestureHandler
---

A discrete gesture handler that activates when the corresponding view is pressed sufficiently long.
When handler gets activated it will turn into [END](state.md#end) state when finger is released.
The handler will fail to recognize if the finger is lifted before the [minimum required time](#mindurationms) or if the finger is moved further than the [allowable distance](#maxdist).

The handler is implemented using [UILongPressGestureRecognizer](https://developer.apple.com/documentation/uikit/uilongpressgesturerecognizer) on iOS and [LongPressGestureHandler](https://github.com/software-mansion/react-native-gesture-handler/blob/master/android/lib/src/main/java/com/swmansion/gesturehandler/LongPressGestureHandler.java) on Android.

## Properties

See [set of properties inherited from base handler class](handler-common.md#properties). Below is a list of properties specific to `LongPressGestureHandler` component:

---
### `minDurationMs`

How long the view has to be pressed in order for gesture to activate. In milliseconds. The default duration is 0.5sec.

---
### `maxDist`

Allow finger movement while pressing. This property expresses the maximum distance it is allowed for the finger to travel before it cancels. The default distance is 10 points.

## Event data

See [set of event attributes from base handler class](handler-common.md#event-data). Below is a list of gesture event attributes specific to `LongPressGestureHandler`:

---
### `x`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the handler. Expressed in point units.

---
### `y`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the handler. Expressed in point units.

---
### `absoluteX`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

---
### `absoluteY`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

## Example

See the [multitap example](https://github.com/software-mansion/react-native-gesture-handler/blob/master/Example/multitap/index.js) from [GestureHandler Example App](example.md) or view it directly on your phone by visiting [our expo demo](https://expo.io/@sauzy3450/react-native-gesture-handler-demo).

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
