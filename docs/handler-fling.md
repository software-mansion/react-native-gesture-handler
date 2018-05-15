---
id: handler-fling
title: FlingGestureHandler
sidebar_label: FlingGestureHandler
---

A discrete gesture handler that activates when the movement is sufficiently long and fast.
Handler gets [ACTIVE](state#active) when movement is sufficiently long and it did not take too much time.
When handler gets activated it will turn into [END](state#end) state when finger is released.
The handler will fail to recognize if the finger is lifted before being activated.
The handler is implemented using [UISwipeGestureRecognizer](https://developer.apple.com/documentation/uikit/uiswipegesturerecognizer) on iOS and from scratch on Android.

## Properties

See [set of properties inherited from base handler class](handler-common.md#properties). Below is a list of properties specific to `FlingGestureHandler` component:

---
### `direction`

Expressed allowed direction of movement. It's possible to set ona or many direction in one parameter:
```js
direction={Directions.RIGHT | Directions.LEFT}
```
or
```js
direction={Directions.DOWN}
```

---
### `numberOfPointers`

Determinate exact number of point required to handle the fling gesture.

## Event data

Gesture events provided to `FlingGestureHandler` callbacks does not include any handler specific attributes beside the [common set of event attributes from base handler class](handler-common#event-data).

## Example

See the [fling  example](https://github.com/kmagiera/react-native-gesture-handler/blob/master/Example/fling/index.js) from [GestureHandler Example App](example) or view it directly on your phone by visiting [our expo demo](https://exp.host/@osdnk/gesturehandlerexample).

```js
const LongPressButton = () => (
  <FlingGestureHandler
      direction={Directions.RIGHT | Directions.LEFT}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.ACTIVE) {
          Alert.alert("I'm flinged!");
        }
      }}>
      <View style={styles.box} />
  </FlingGestureHandler>
);
```