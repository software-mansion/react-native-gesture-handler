---
id: fling-gh
title: FlingGestureHandler
sidebar_label: Fling
---

A discrete gesture handler that activates when the movement is sufficiently long and fast.
Handler gets [ACTIVE](../../state#active) when movement is sufficiently long and it does not take too much time.
When handler gets activated it will turn into [END](../../state#end) state when finger is released.
The handler will fail to recognize if the finger is lifted before being activated.
The handler is implemented using [UISwipeGestureRecognizer](https://developer.apple.com/documentation/uikit/uiswipegesturerecognizer) on iOS and from scratch on Android.

## Properties

See [set of properties inherited from base handler class](common-gh#properties). Below is a list of properties specific to `FlingGestureHandler` component:

### `direction`

Expressed allowed direction of movement. It's possible to pass one or many directions in one parameter:

```js
direction={Directions.RIGHT | Directions.LEFT}
```

or

```js
direction={Directions.DOWN}
```

### `numberOfPointers`

Determine exact number of points required to handle the fling gesture.

## Event data

See [set of event attributes from base handler class](common-gh#event-data). Below is a list of gesture event attributes specific to `FlingGestureHandler`:

### `x`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the handler. Expressed in point units.

### `y`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the handler. Expressed in point units.

### `absoluteX`

X coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`x`](#x) in cases when the original view can be transformed as an effect of the gesture.

### `absoluteY`

Y coordinate of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the root view. The value is expressed in point units. It is recommended to use it instead of [`y`](#y) in cases when the original view can be transformed as an effect of the gesture.

## Example

See the [fling example](https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/fling/index.tsx) from [GestureHandler Example App](../../example) or view it directly on your phone by visiting [our expo demo](https://snack.expo.io/@adamgrzybowski/react-native-gesture-handler-demo).

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
