---
id: handler-common
title: Common handler properties
sidebar_label: BaseGestureHandler
---

This page covers the common set of properties all gesture handler components expose.

## Parameters

### `enabled`

Takes a boolean value.
Indicates if the given handler should be analyzing stream of touch events or not.
When set to `false` we can be sure that the handler will never [activate](state.md#active).
If the value gets updated while the handler already started recognizing gesture it will immediately [fail](state.md#failed) or [cancel](state.md#cancelled) recognizing depending on its current state.
Default value is `true`

### `shouldCancelWhenOutside`

Takes a boolean value.
When `true` the handler will [cancel](state.md#cancelled) or [fail](state.md#failed) recognition (depending on its current state) whenever the finger leaves the area of the connected view.
Default value of this property is different depending on the handler type.
Most of the handlers defaults to `true` but in case of the [`LongPressGestureHandler`](handler-longpress.md) and [`TapGestureHandler`](handler-tap.md)

### `simultaniousHandlers`

### `waitFor`

### `hitSlop`

This parameter enables control over what part of the connected view area can be used to [begin](state.md#began) recognizing the gesture.
When a negative number is provided the bounds of the view will reduce the area by the given number of points in each of the sides evenly.

Instead you can pass an object to specify how each boundary side should be reduced by providing different number of points for `left`, `right`, `top` or `bottom` sides.
You can alternatively provide `horizontal` or `vertical` instead of specifying directly `left`, `right` or `top` and `bottom`.
Finally, the object can also take `width` and `height` attributes.
When `width` is set it is only allow to specify one of the sides `right` or `left`.
Similarly when `height` is provided only `top` or `bottom` can be set.
Specifying `width` or `height` is useful if we only want the gesture to activate on the edge of the view. In which case for example we can set `left: 0` and `width: 20` which would make it possible for the gesture to be recognize when started no more than 20 points from the left edge.

**IMPORTANT:** Note that this parameter is primarily designed to reduce the area where gesture can activate. Hence it is only supported for all the values (except `width` and `height`) to be non positive (0 or lower). Although on Android it is supported for the values to also be positive and therefore allow to expand beyond view bounds but not further than the parent view bounds. To achieve this effect on both platforms you can use React Native's View [hitSlop](https://facebook.github.io/react-native/docs/view.html#props) property.

### `onGestureEvent`

Takes a callback that is going to be triggered for each subsequent touch event while the handler is in an [ACTIVE](state.md#active) state. Event payload depends on the particular handler type. Common set of event data attributes is documented [below](#event-data) and handler specific attributes are documented on the corresponding handler pages. E.g. event payload for [`PinchGestureHandler`](handler-rotation.md#event-data) contains `scale` attribute that represents how the distance between fingers changed since when the gesture started.

Instead of a callback [`Animated.event`](https://facebook.github.io/react-native/docs/animated.html#event) object can be used. Also Animated events with `useNativeDriver` flag enabled __are fully supported__.

### `onHandlerStateChange`

Takes a callback that is going to be triggered when [state](state.md) of the given handler changes.

The event payload contains the same payload as in case of [`onGestureEvent`](#ongestureevent) including handler specific event attributes some handlers may provide.

In addition `onHandlerStateChange` event payload contains `oldState` attribute which represents the [state](state.md) of the handler right before the change.

## Event data
