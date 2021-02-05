---
id: rotation-gh
title: RotationGestureHandler
sidebar_label: Rotation
---

A continuous gesture handler that recognizes rotation gesture and allows for tracking its movement.

The handler [activates](../../state.md#active) when fingers are placed on the screen and change their position in a proper way.
Gesture callback can be used for continuous tracking of the rotation gesture. It provides information about the rotation, anchor (focal) point of gesture and progress of rotating.

The handler is implemented using [UIRotationGestureRecognizer](https://developer.apple.com/documentation/uikit/uirotationgesturerecognizer) on iOS and from scratch on Android.

## Properties

Properties provided to `RotationGestureHandler` do not extend [common set of properties from base handler class](common-gh#properties).

## Event data

See [set of event attributes from base handler class](common-gh#event-data). Below is a list of gesture event attributes specific to `RotationGestureHandler`:

### `rotation`

The rotation of the gesture in radians.

### `velocity`

Velocity of the pan gesture the current moment. The value is expressed in point units per second.

### `anchorX`

Position expressed in points along X axis of center anchor point of gesture

### `anchorY`

Position expressed in points along Y axis of center anchor point of gesture

## Example

See the [scale and rotation example](https://github.com/software-mansion/react-native-gesture-handler/blob/master/examples/Example/scaleAndRotate/index.js) from [GestureHandler Example App](../../example) or view it directly on your phone by visiting [our expo demo](https://snack.expo.io/@adamgrzybowski/react-native-gesture-handler-demo).

```js
class RotableBox extends React.Component {
  _rotate = new Animated.Value(0);
  _rotateStr = this._rotate.interpolate({
    inputRange: [-100, 100],
    outputRange: ['-100rad', '100rad'],
  });
  _lastRotate = 0;
  _onRotateGestureEvent = Animated.event(
    [{ nativeEvent: { rotation: this._rotate } }],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );
  _onRotateHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastRotate += event.nativeEvent.rotation;
      this._rotate.setOffset(this._lastRotate);
      this._rotate.setValue(0);
    }
  };
  render() {
    return (
      <RotationGestureHandler
        onGestureEvent={this._onRotateGestureEvent}
        onHandlerStateChange={this._onRotateHandlerStateChange}>
        <Animated.Image
          style={[
            styles.pinchableImage,
            {
              transform: [{ perspective: 200 }, { rotate: this._rotateStr }],
            },
          ]}
        />
      </RotationGestureHandler>
    );
  }
}
```
