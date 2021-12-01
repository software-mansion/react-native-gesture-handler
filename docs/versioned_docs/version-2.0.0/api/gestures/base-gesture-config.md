### Properties common to all gestures:

### `enabled(value: boolean)`

Indicates whether the given handler should be analyzing stream of touch events or not.
When set to `false` we can be sure that the handler's state will **never** become [`ACTIVE`](../../under-the-hood/states-events.md#active).
If the value gets updated while the handler already started recognizing a gesture, then the handler's state it will immediately change to [`FAILED`](../../under-the-hood/states-events.md#failed) or [`CANCELLED`](../../under-the-hood/states-events.md#cancelled) (depending on its current state).
Default value is `true`.

### `shouldCancelWhenOutside(value: boolean)`

When `true` the handler will [cancel](../../under-the-hood/states-events.md#cancelled) or [fail](../../under-the-hood/states-events.md#failed) recognition (depending on its current state) whenever the finger leaves the area of the connected view.
Default value of this property is different depending on the handler type.
Most handlers' `shouldCancelWhenOutside` property defaults to `false` except for the [`LongPressGesture`](./long-press-gesture.md) and [`TapGesture`](./tap-gesture.md) which default to `true`.

### `hitSlop(settings)`

This parameter enables control over what part of the connected view area can be used to [begin](../../under-the-hood/states-events.md#began) recognizing the gesture.
When a negative number is provided the bounds of the view will reduce the area by the given number of points in each of the sides evenly.

Instead you can pass an object to specify how each boundary side should be reduced by providing different number of points for `left`, `right`, `top` or `bottom` sides.
You can alternatively provide `horizontal` or `vertical` instead of specifying directly `left`, `right` or `top` and `bottom`.
Finally, the object can also take `width` and `height` attributes.
When `width` is set it is only allow to specify one of the sides `right` or `left`.
Similarly when `height` is provided only `top` or `bottom` can be set.
Specifying `width` or `height` is useful if we only want the gesture to activate on the edge of the view. In which case for example we can set `left: 0` and `width: 20` which would make it possible for the gesture to be recognize when started no more than 20 points from the left edge.

**IMPORTANT:** Note that this parameter is primarily designed to reduce the area where gesture can activate. Hence it is only supported for all the values (except `width` and `height`) to be non positive (0 or lower). Although on Android it is supported for the values to also be positive and therefore allow to expand beyond view bounds but not further than the parent view bounds. To achieve this effect on both platforms you can use React Native's View [hitSlop](https://facebook.github.io/react-native/docs/view.html#props) property.

### `withRef(ref)`

Sets a ref to the gesture object, allowing for interoperability with the old API.

### `simultaneousWithExternalGesture(otherGesture1, otherGesture2, ...)`

Adds a gesture that should be recognized simultaneously with this one.

**IMPORTANT:** Note that this method only marks the relation between gestures, without [composing them](../../gesture-composition). [`GestureDetector`](gesture-detector) will not recognize the `otherGestures` and it needs to be added to another detector in order to be recognized.

### `requireExternalGestureToFail(otherGesture1, otherGesture2, ...)`

Adds a relation requiring another gesture to fail, before this one can activate.

**IMPORTANT:** Note that this method only marks the relation between gestures, without [composing them](../../gesture-composition).[`GestureDetector`](gesture-detector) will not recognize the `otherGestures` and it needs to be added to another detector in order to be recognized.
