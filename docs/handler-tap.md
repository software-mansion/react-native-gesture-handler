---
id: handler-tap
title: TapGestureHandler
sidebar_label: TapGestureHandler
---

A discrete gesture handler that recognizes tap (or many taps).  

Tap gestures detect one or more fingers touching the screen briefly. 
The fingers involved in these gestures must not move significantly from the initial touch points, 
and you can configure the number of times the fingers must touch the screen and allowable distance. 
For example, you might configure tap gesture recognizers to detect single taps, double taps, or triple taps.

For the handler to be [activated](state.md#active) the specified number of fingers must tap the view a specified number of times in proper time and with short enough delay. When handler gets activated it will turn into [END](state.md#end) state immediately.
The handler will fail to recognize if the finger is moved further than the [allowable distance](#maxdist).

## Properties

See [set of properties inherited from base handler class](handler-common.md#properties). Below is a list of properties specific to `TapGestureHandler` component:

---
### `minPointers`
A number of fingers that is required to be placed before handler can [activate](state.md#active). Should be a positive integer.

---
### `maxDurationMs`
Time expressed in milliseconds which defines how fast finger has to be released after touch.

---
### `maxDelayMs`
Time expressed in milliseconds which could pass before next tap if many taps are required 

---
### `numberOfTaps`
A number of tap event required to  [activate](state.md#active) handler

---
### `maxDeltaX`

When the finger travels the given distance expressed in points along X axis and handler hasn't yet [activated](state.md#active) it will fail recognizing the gesture.

---
### `maxDeltaY`

When the finger travels the given distance expressed in points along Y axis and handler hasn't yet [activated](state.md#active) it will fail recognizing the gesture.

---
### `maxDist`

When the finger travels the given distance expressed in points and handler hasn't yet [activated](state.md#active) it will fail recognizing the gesture.



## Event data
Gesture events provided to `TapGestureHandler` callbacks does not include any handler specific attributes beside the [common set of event attributes from base handler class](handler-common.md#event-data).

## Example

See the [multitap example](https://github.com/kmagiera/react-native-gesture-handler/blob/master/Example/multitap/index.js) from [GestureHandler Example App](example.md) or view it directly on your phone by visiting [our expo demo](https://exp.host/@osdnk/gesturehandlerexample).

```js
export class PressBox extends Component {
  doubleTapRef = React.createRef();
  render() {
    return (
      <TapGestureHandler
        onHandlerStateChange={this._onSingleTap}
        waitFor={this.doubleTapRef}>
        <TapGestureHandler
          ref={this.doubleTapRef}
          numberOfTaps={2}>
          <View style={styles.box} />
        </TapGestureHandler>
      </TapGestureHandler>
    );
  }
}
```