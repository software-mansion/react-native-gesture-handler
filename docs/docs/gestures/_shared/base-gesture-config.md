### Properties common to all gestures:

### `enabled(value: boolean)`

Indicates whether the given handler should be analyzing stream of touch events or not.
When set to `false` we can be sure that the handler's state will **never** become [`ACTIVE`](/docs/fundamentals/states-events#active).
If the value gets updated while the handler already started recognizing a gesture, then the handler's state it will immediately change to [`FAILED`](/docs/fundamentals/states-events#failed) or [`CANCELLED`](/docs/fundamentals/states-events#cancelled) (depending on its current state).
Default value is `true`.

### `shouldCancelWhenOutside(value: boolean)`

When `true` the handler will [cancel](/docs/fundamentals/states-events#cancelled) or [fail](/docs/fundamentals/states-events#failed) recognition (depending on its current state) whenever the finger leaves the area of the connected view.
Default value of this property is different depending on the handler type.
Most handlers' `shouldCancelWhenOutside` property defaults to `false` except for the [`LongPressGesture`](/docs/gestures/long-press-gesture) and [`TapGesture`](/docs/gestures/tap-gesture) which default to `true`.

### `hitSlop(settings)`

This parameter enables control over what part of the connected view area can be used to [begin](/docs/fundamentals/states-events#began) recognizing the gesture.
When a negative number is provided the bounds of the view will reduce the area by the given number of points in each of the sides evenly.

Instead you can pass an object to specify how each boundary side should be reduced by providing different number of points for `left`, `right`, `top` or `bottom` sides.
You can alternatively provide `horizontal` or `vertical` instead of specifying directly `left`, `right` or `top` and `bottom`.
Finally, the object can also take `width` and `height` attributes.
When `width` is set it is only allow to specify one of the sides `right` or `left`.
Similarly when `height` is provided only `top` or `bottom` can be set.
Specifying `width` or `height` is useful if we only want the gesture to activate on the edge of the view. In which case for example we can set `left: 0` and `width: 20` which would make it possible for the gesture to be recognize when started no more than 20 points from the left edge.

**IMPORTANT:** Note that this parameter is primarily designed to reduce the area where gesture can activate. Hence it is only supported for all the values (except `width` and `height`) to be non positive (0 or lower). Although on Android it is supported for the values to also be positive and therefore allow to expand beyond view bounds but not further than the parent view bounds. To achieve this effect on both platforms you can use React Native's View [hitSlop](https://reactnative.dev/docs/view.html#hitslop) property.

### `withRef(ref)`

Sets a ref to the gesture object, allowing for interoperability with the old
API.

### `withTestId(testID)`

Sets a `testID` property for gesture object, allowing for querying for it in tests.

### `cancelsTouchesInView(value)` (**iOS only**)

Accepts a boolean value.
When `true`, the gesture will cancel touches for native UI components (`UIButton`, `UISwitch`, etc) it's attached to when it becomes [`ACTIVE`](/docs/fundamentals/states-events#active).
Default value is `true`.

### `runOnJS(value: boolean)`

When `react-native-reanimated` is installed, the callbacks passed to the gestures are automatically workletized and run on the UI thread when called. This option allows for changing this behavior: when `true`, all the callbacks will be run on the JS thread instead of the UI thread, regardless of whether they are worklets or not.
Defaults to `false`.

### `simultaneousWithExternalGesture(otherGesture1, otherGesture2, ...)`

Adds a gesture that should be recognized simultaneously with this one.

**IMPORTANT:** Note that this method only marks the relation between gestures, without [composing them](/docs/fundamentals/gesture-composition). [`GestureDetector`](/docs/gestures/gesture-detector) will not recognize the `otherGestures` and it needs to be added to another detector in order to be recognized.

### `requireExternalGestureToFail(otherGesture1, otherGesture2, ...)`

Adds a relation requiring another gesture to fail, before this one can activate.

### `blocksExternalGesture(otherGesture1, otherGesture2, ...)`

Adds a relation that makes other gestures wait with activation until this gesture fails (or doesn't start at all).

**IMPORTANT:** Note that this method only marks the relation between gestures, without [composing them](/docs/fundamentals/gesture-composition).[`GestureDetector`](/docs/gestures/gesture-detector) will not recognize the `otherGestures` and it needs to be added to another detector in order to be recognized.

### `activeCursor(value)` (Web only)

This parameter allows to specify which cursor should be used when gesture activates. Supports all CSS cursor values (e.g. `"grab"`, `"zoom-in"`). Default value is set to `"auto"`.
