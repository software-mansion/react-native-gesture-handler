Combining [Pan](/docs/gestures/use-pan-gesture), [Pinch](/docs/gestures/use-pinch-gesture) and [Rotation](/docs/gestures/use-rotation-gesture) on a single view — the "photo viewer" interaction where you can drag, zoom and twist an image at the same time — is a common use case. Gesture Handler doesn't ship a dedicated component for it, but you can build it yourself on top of the existing gestures. There are two ideas that make it work; the rest is wiring.

This guide assumes you're using [Reanimated](https://docs.swmansion.com/react-native-reanimated/) to run the transformation on the UI thread. The [full example](#full-example) is at the end of this page, and a version of it can be found in the [example app](https://github.com/software-mansion/react-native-gesture-handler/tree/main/apps/common-app/src/new_api/complicated/transformations).

## Use a matrix, not separate transforms

Store the whole transformation as a single affine matrix. It bundles translation, scale and rotation into one value that you compose by multiplying matrices together in whatever order you need, and since the result is itself a matrix you can store it and let each new gesture build on top. That gives you a natural split: the accumulated transform lives in the matrix, while the in-progress gesture stays as the plain `scale`, `rotation` and `translation` the callbacks hand you as the fingers move. Each frame, combine the two to draw the view. When the gesture ends, fold its values into the matrix and reset them, so the next gesture picks up where it left off. You don't need to follow the underlying math — the [full example](#full-example) has the handful of small helper functions that implement it.

Why not keep separate `scale`, `rotation` and `translation` values and pass them to a `transform` array instead? That works for a single gesture, but falls apart once you want each one to build on the last. The array does let you control the order its entries apply in, but there's no clean place to accumulate the running result: to preserve what previous gestures did, you'd have to keep appending an entry for every incremental translation, scale and rotation, and React would rebuild the whole matrix from that ever-growing list on each render.

## Keep the origin stable

Scaling and rotation pivot around the origin, but the user expects them to pivot around the point between their fingers. To move the pivot, wrap the transform between two translations — shift that point to the origin, apply the scale or rotation, then shift it back. Do this while building the matrix, once for the scale and once for the rotation:

```ts
matrix = multiply(matrix, translate(origin.x, origin.y));
matrix = multiply(matrix, scale(scaleValue, scaleValue));
matrix = multiply(matrix, translate(-origin.x, -origin.y));
```

Capture that pivot once, when the gesture activates, and keep it in a shared value:

```jsx
const pinch = usePinchGesture({
  onActivate: (e) => {
    origin.value = {
      x: -(e.focalX - size.width / 2),
      y: -(e.focalY - size.height / 2),
    };
  },
  // ...
});
```

Set it only on activation and leave it untouched until the gesture ends, so the pivot stays stable — recomputing it every frame, or letting a second simultaneous gesture overwrite it, makes the view jump. The focal point arrives relative to the view rather than its center, which is what the size-based adjustment handles (read the size with [`onLayout`](https://reactnative.dev/docs/view#onlayout)). And when Pinch and Rotation run together, let only the first one set the pivot.

## Full example

Put both ideas together and you have the whole interaction. Each gesture updates its own shared value as the fingers move and folds the result into the stored matrix when it ends; [`useSimultaneousGestures`](/docs/composition/use-simultaneous-gestures) runs `Pan`, `Pinch`, `Rotation` and a double-tap zoom at the same time.
