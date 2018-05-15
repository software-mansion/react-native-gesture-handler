---
id: handler-longpress
title: LongPressGestureHandler
sidebar_label: LongPressGestureHandler
---

A discrete gesture handler that activates when the corresponding view is pressed sufficiently long.
When handler gets activated it will turn into [END](state.md#end) state when finger is released.
The handler will fail to recognize if the finger is lifted before the [minimum required time](#mindurationms) or if the finger is moved further than the [allowable distance](#maxdist).

The handler is implemented using [UILongPressGestureRecognizer](https://developer.apple.com/documentation/uikit/uilongpressgesturerecognizer) on iOS and [LongPressGestureHandler](https://github.com/kmagiera/react-native-gesture-handler/blob/master/android/lib/src/main/java/com/swmansion/gesturehandler/LongPressGestureHandler.java) on Android.

## Properties

See [set of properties inherited from base handler class](handler-common.md#properties). Below is a list of properties specific to `LongPressGestureHandler` component:

---
### `minDurationMs`

How long the view has to be pressed in order for gesture to activate. In milliseconds. The default duration is 0.5sec.

---
### `maxDist`

Allow finger movement while pressing. This property expresses the maximum distance it is allowed for the finger to travel before it cancels. The default distance is 10 points.

## Event data

Gesture events provided to `LongPressGestureHandler` callbacks does not include any handler specific attributes beside the [common set of event attributes from base handler class](handler-common.md#event-data).

## Example

See the [multitap example](https://github.com/kmagiera/react-native-gesture-handler/blob/master/Example/multitap/index.js) from [GestureHandler Example App](example.md) or view it directly on your phone by visiting [our expo demo](https://exp.host/@osdnk/gesturehandlerexample).

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