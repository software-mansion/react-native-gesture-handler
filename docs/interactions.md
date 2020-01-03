---
id: interactions
title: Cross handler interactions
sidebar_label: Cross handler interactions
---

Gesture handlers can "communicate" with each other in order to allow for defining complex gesture interactions and to control how they [activate](state.md#active) in certain scenarios.

There are two means of such a control at the moment described in the sections below.
In each of the cases it is necessary to provide a reference of one handler as a property to the other.
Gesture handler relies on ref objects created using [`React.createRef()`](https://reactjs.org/docs/refs-and-the-dom.html) and introduced in [React 16.3](https://reactjs.org/blog/2018/03/29/react-v-16-3.html#createref-api).

## Simultaneous recognition

By default at a given time only one gesture handler is allowed to be in an [active](state.md#active) state.
So when a gesture handler recognizes a gesture, it [cancels](state.md#cancelled) all the other handlers in [began](state.md#began) and prevents any new handlers from receiving a stream of touch events for as long as it is [active](state.md#active).

This behavior can be altered using [`simultaneousHandlers`](handler-common.md#simultaneousHandlers) property that is available for all type of handlers.
The property takes a ref or an array of refs to other handlers.
Handlers connected this way will be allowed to be in an [active](state.md#active) state at the same time.
<!-- Moreover, when the given handler [activates](state.md#active) it will -->

---
### Use cases

Simultaneous recognition needs to be used when implementing a photo preview component that allows for zooming in (scaling) the photo, rotating the photo and panning it while it is zoomed in.
In this case we would use a [`PinchGestureHandler`](handler-pinch.md), [`RotationGestureHandler`](handler-rotation.md) and [`PanGestureHandler`](handler-pan.md) that all would have to recognize simultaneously.

---
### Example

See the ["Scale, rotate & tilt" example](https://github.com/software-mansion/react-native-gesture-handler/blob/master/Example/scaleAndRotate/index.js) from [GestureHandler Example App](example.md) or view it directly on your phone by visiting [our expo demo](https://expo.io/@sauzy3450/react-native-gesture-handler-demo).

```js
class PinchableBox extends React.Component {
  // ...take a look on full implementation in an Example app
  render() {
    const imagePinch = React.createRef();
    const imageRotation = React.createRef();
    return (
      <RotationGestureHandler
        ref={imageRotation}
        simultaneousHandlers={imagePinch}
        onGestureEvent={this._onRotateGestureEvent}
        onHandlerStateChange={this._onRotateHandlerStateChange}>
        <Animated.View>
          <PinchGestureHandler
            ref={imagePinch}
            simultaneousHandlers={imageRotation}
            onGestureEvent={this._onPinchGestureEvent}
            onHandlerStateChange={this._onPinchHandlerStateChange}>
            <Animated.View style={styles.container} collapsable={false}>
              <Animated.Image
                style={[styles.pinchableImage, { /* events-related transformations */ }]}
              />
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </RotationGestureHandler>
    );
  }
}
```

## Awaiting other handlers

---
### Use cases

A good example where awaiting is necessary is when we want to have a single and double tap handlers registered for one view (button).
In such a case we need to make single tap handler await double tap.
Otherwise if we try to perform a double tap the single tap handler will fire just after we hit the button for the first time and therefore [cancel](state.md#cancelled) double tap handler.

---
### Example

See the ["Multitap" example](https://github.com/software-mansion/react-native-gesture-handler/blob/master/Example/multitap/index.js) from [GestureHandler Example App](example.md) or view it directly on your phone by visiting [our expo demo](https://expo.io/@sauzy3450/react-native-gesture-handler-demo).

```js
const doubleTap = React.createRef();
const PressBox = () => (
  <TapGestureHandler
    onHandlerStateChange={({ nativeEvent }) => nativeEvent.state === State.ACTIVE && Alert.alert('Single tap!')}
    waitFor={doubleTap}>
    <TapGestureHandler
      ref={doubleTap}
      onHandlerStateChange={({ nativeEvent }) => nativeEvent.state === State.ACTIVE && Alert.alert('You\'re so fast')}
      numberOfTaps={2}>
      <View style={styles.box}/>
    </TapGestureHandler>
  </TapGestureHandler>
);
```
