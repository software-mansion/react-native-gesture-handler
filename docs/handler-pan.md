---
id: handler-pan
title: PanGestureHandler
sidebar_label: PanGestureHandler
---

A continuous gesture handler that recognizes panning (dragging) gesture and allows for tracking their movement.

The handler [activates](state.md#active) when finger is placed on the screen and moved by some initial distance. The distance can be configured and allow for detecting only vertical or horizontal pan. Also the number of fingers required for the handler to [activates](state.md#active) can be [configured](#minPointers), which allows for detecting multifinger swipes.

Gesture callback can be used for continuous tracking of the pan gesture. It provides information about the translation from the start of the gesture as well as tracks the velocity.

The handler is implemented using [UIPanGestureRecognizer](https://developer.apple.com/documentation/uikit/uipangesturerecognizer) on iOS and [PanGestureHandler](https://github.com/kmagiera/react-native-gesture-handler/blob/master/android/lib/src/main/java/com/swmansion/gesturehandler/PanGestureHandler.java) on Android.

## Properties

See [set of properties inherited from base handler class](handler-common.md#properties). Below is a list of properties specific to `LongPressGestureHandler` component:

---
### `minDeltaX`

---
### `minDeltaY`

---
### `maxDeltaX`

---
### `maxDeltaY`

---
### `minOffsetX`

---
### `minOffsetY`

---
### `minPointers`


---
### `maxPointers`

---
### `avgTouches` (Android only)

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