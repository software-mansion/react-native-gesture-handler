A gesture that allows other touch handling components to work within RNGH's gesture system. This streamlines interactions between gestures and the native component, allowing it to form [relations](/docs/fundamentals/gesture-composition) with other gestures.

When used, the native component should be the direct child of a [`GestureDetector`](/docs/fundamentals/gesture-detectors#gesture-detector).

> **Danger**
>
> Do not use `Native` gesture with components exported by React Native Gesture Handler, as they already have it pre-applied. Attaching `Native` gesture twice will result in undefined behavior.

## Example

This example renders a `ScrollView` with multiple colored rectangles, where each rectangle has a black section. Starting a touch on a black section will disable the `ScrollView` for the duration of the [`Pan`](/docs/gestures/use-pan-gesture) gesture.

## Remarks

* `Native` gesture can be used as part of [gesture composition and cross-component interactions](/docs/fundamentals/gesture-composition) just like any other gesture. You can use this to block a native component for the duration of the gesture or to make it work alongside a gesture.

* Due to platform API limitations, the `Native` gesture has restricted functionality on `web`. For instance, it cannot be used to block scrolling on a `ScrollView`.

## Config

### shouldActivateOnStart

```ts
shouldActivateOnStart: boolean | SharedValue<boolean>;
```

When `true`, the underlying handler will activate unconditionally when it receives any touches.

### disallowInterruption

```ts
disallowInterruption: boolean | SharedValue<boolean>;
```

When `true`, this handler cancels all other gesture handlers when it activates.

## Callbacks

## Event data

### pointerInside

```ts
pointerInside: boolean;
```

`true` if the gesture was performed inside the containing view, `false` otherwise.
