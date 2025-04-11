---
id: force-gh
title: ForceTouchGestureHandler (iOS only)
sidebar_label: Force touch
---

A continuous gesture handler that recognizes force of a touch. It allows for tracking pressure of touch on some iOS devices.
The handler [activates](/docs/under-the-hood/state#active) when pressure of touch if greater or equal than `minForce`. It fails if pressure is greater than `maxForce`
Gesture callback can be used for continuous tracking of the touch pressure. It provides information for one finger (the first one).

At the beginning of the gesture, the pressure factor is 0.0. As the pressure increases, the pressure factor increases proportionally. The maximum pressure is 1.0.

The handler is implemented using custom [UIGestureRecognizer](https://developer.apple.com/documentation/uikit/uigesturerecognizer) on iOS. There's no implementation provided on Android and it simply render children without any wrappers.
Since this behaviour is only provided on some iOS devices, this handler should not be used for defining any crucial behaviors. Use it only as an additional improvement and make all features to be accessed without this handler as well.

# Properties

See [set of properties inherited from base handler class](common-gh#properties). Below is a list of properties specific to `ForceTouchGestureHandler` component:

### `minForce`

A minimal pressure that is required before handler can [activate](/docs/under-the-hood/state#active). Should be a value from range `[0.0, 1.0]`. Default is `0.2`.

### `maxForce`

A maximal pressure that could be applied for handler. If the pressure is greater, handler [fails](/docs/under-the-hood/state#failed). Should be a value from range `[0.0, 1.0]`.

### `feedbackOnActivation`

Boolean value defining if haptic feedback has to be performed on activation.

## Event data

See [set of event attributes from base handler class](common-gh#event-data). Below is a list of gesture event attributes specific to `ForceTouchGestureHandler`:

### `force`

The pressure of a touch.

## Static method

### `forceTouchAvailable`

You may check if it's possible to use `ForceTouchGestureHandler` with `ForceTouchGestureHandler.forceTouchAvailable`

## Example

See the [force touch handler example](https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/basic/forcetouch/index.tsx) from [GestureHandler Example App](../../example) or view it directly on your phone by visiting [our expo demo](https://snack.expo.io/@adamgrzybowski/react-native-gesture-handler-demo).

```js
<ForceTouchGestureHandler
  minForce={0}
  onGestureEvent={this._onGestureEvent}
  onHandlerStateChange={this._onHandlerStateChange}>
  <Animated.View
    style={[
      styles.box,
      { transform: [{ scale: Animated.add(1, this.force) }] },
    ]}
  />
</ForceTouchGestureHandler>
```
