---
id: handler-pan
title: PanGestureHandler
sidebar_label: PanGestureHandler
---

A continuous gesture handler that recognizes panning (dragging) gesture and allows for tracking their movement.

The handler [activates](state.md#active) when finger is placed on the screen and moved by some initial distance. The distance can be configured and allow for detecting only vertical or horizontal pan. Also the number of fingers required for the handler to [activates](state.md#active) can be [configured](#minPointers), which allows for detecting multifinger swipes.

Gesture callback can be used for continuous tracking of the pan gesture. It provides information about the translation from the start of the gesture as well as tracks the velocity.

The handler is implemented using [UIPanGestureRecognizer](https://developer.apple.com/documentation/uikit/uipangesturerecognizer) on iOS and [PanGestureHandler](https://github.com/kmagiera/react-native-gesture-handler/blob/master/android/lib/src/main/java/com/swmansion/gesturehandler/PanGestureHandler.java) on Android.

## Differences in multi touch pan handling between platforms

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

---
### `x`

---
### `y`

---
### `absoluteX`

---
### `absoluteY`

---
### `translationX`

---
### `translationY`

---
### `velocityX`

---
### `velocityY`

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