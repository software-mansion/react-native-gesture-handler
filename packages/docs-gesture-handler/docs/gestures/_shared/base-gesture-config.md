### enabled

```ts
enabled: boolean | SharedValue<boolean>;
```

Indicates whether the given handler should be analyzing stream of touch events or not.
When set to `false` we can be sure that the handler will **never** activate.
If the value gets updated while the handler already started recognizing a gesture, then the handler will stop processing gestures immediately.
Default value is `true`.

### shouldCancelWhenOutside

```ts
shouldCancelWhenOutside: boolean | SharedValue<boolean>;
```

When `true` the handler will stop recognition whenever the finger leaves the area of the connected view.
Default value of this property is different depending on the handler type.
Most handlers' `shouldCancelWhenOutside` property defaults to `false` except for the [`LongPressGesture`](/docs/gestures/use-long-press-gesture) and [`TapGesture`](/docs/gestures/use-tap-gesture) which default to `true`.

### hitSlop

```ts
hitSlop: HitSlop | SharedValue<HitSlop>;
```

```ts
type HitSlop =
  | number
  | null
  | undefined
  | Partial<
      Record<
        'left' | 'right' | 'top' | 'bottom' | 'vertical' | 'horizontal',
        number
      >
    >
  | Record<'width' | 'left', number>
  | Record<'width' | 'right', number>
  | Record<'height' | 'top', number>
  | Record<'height' | 'bottom', number>;
```

This parameter enables control over what part of the connected view area can be used to begin recognizing the gesture.
When a negative number is provided the bounds of the view will reduce the area by the given number of points in each of the sides evenly.

Instead you can pass an object to specify how each boundary side should be reduced by providing different number of points for `left`, `right`, `top` or `bottom` sides.
You can alternatively provide `horizontal` or `vertical` instead of specifying directly `left`, `right` or `top` and `bottom`.
Finally, the object can also take `width` and `height` attributes.
When `width` is set it is only allow to specify one of the sides `right` or `left`.
Similarly when `height` is provided only `top` or `bottom` can be set.
Specifying `width` or `height` is useful if we only want the gesture to activate on the edge of the view. In which case for example we can set `left: 0` and `width: 20` which would make it possible for the gesture to be recognize when started no more than 20 points from the left edge.

**IMPORTANT:** Note that this parameter is primarily designed to reduce the area where gesture can activate. Hence it is only supported for all the values (except `width` and `height`) to be non positive (0 or lower). Although on Android it is supported for the values to also be positive and therefore allow to expand beyond view bounds but not further than the parent view bounds. To achieve this effect on both platforms you can use React Native's View [hitSlop](https://reactnative.dev/docs/view.html#hitslop) property.

### testID

```ts
testID: string;
```

Sets a `testID` property for gesture object, allowing for querying for it in tests.

### cancelsTouchesInView (**iOS only**)

```ts
cancelsTouchesInView: boolean | SharedValue<boolean>;
```

Accepts a boolean value.
When `true`, the gesture will cancel touches for native UI components (`UIButton`, `UISwitch`, etc) it's attached to upon activation.
Default value is `true`.

### runOnJS

**Requires `react-native-reanimated`**

```ts
runOnJS: boolean | SharedValue<boolean>;
```

If set to `true`, callbacks will be executed on JS runtime. Can be changed dynamically throughout gesture lifecycle. Defaults to `false`. For more details, see the [runOnJS](/docs/fundamentals/reanimated-interactions#runonjs) section.

### disableReanimated

**Requires `react-native-reanimated`**

```ts
disableReanimated: boolean | SharedValue<boolean>;
```

If set to `true`, the gesture will ignore any interaction with `Reanimated`. This property cannot be changed during the gesture's lifecycle. For more details, see the [disableReanimated](/docs/fundamentals/reanimated-interactions#disablereanimated) section.

### simultaneousWith

```ts
simultaneousWith: Gesture | Gesture[]
```

Adds a gesture that should be recognized simultaneously with this one.

**IMPORTANT:** Note that this method only marks the relation between gestures, without [composing them](/docs/fundamentals/gesture-composition). [`GestureDetector`](/docs/fundamentals/gesture-detectors#gesture-detector) will not recognize the `otherGestures` and it needs to be added to another detector in order to be recognized.

### requireToFail

```ts
requireToFail: Gesture | Gesture[]
```

Adds a relation requiring another gesture to fail, before this one can activate.

**IMPORTANT:** Note that this method only marks the relation between gestures, without [composing them](/docs/fundamentals/gesture-composition). [`GestureDetector`](/docs/fundamentals/gesture-detectors#gesture-detector) will not recognize the `otherGestures` and it needs to be added to another detector in order to be recognized.

### block

```ts
block: Gesture | Gesture[]
```

Adds a relation that makes other gestures wait with activation until this gesture fails (or doesn't start at all).

**IMPORTANT:** Note that this method only marks the relation between gestures, without [composing them](/docs/fundamentals/gesture-composition).[`GestureDetector`](/docs/fundamentals/gesture-detectors#gesture-detector) will not recognize the `otherGestures` and it needs to be added to another detector in order to be recognized.

### activeCursor

```ts
activeCursor: ActiveCursor | SharedValue<ActiveCursor>;
```

This parameter allows to specify which cursor should be used when gesture activates. Supports all [CSS cursor values](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/cursor#keyword) (e.g. `"grab"`, `"zoom-in"`). Default value is set to `"auto"`.
