---
id: about-handlers
title: About Gesture Handlers
sidebar_label: About Gesture Handlers
---

Gesture handlers are the core building blocks of this library.
We use this term to describe elements of the native touch system that the library allows us to instantiate and control from Javascript using [React's Component](https://reactjs.org/docs/react-component.html) interface.

Each handler type is capable of recognizing one type of gesture (pan, pinch, etc.) and provides gesture-specific information via events (translation, scale, etc.).

Handlers analyse touch stream synchronously in the UI thread. This allows for the interactions to be uninterrupted even when Javascript thread is blocked.

Each handler works as an isolated state machine. It takes touch stream as an input and based on in it can flip between [states](state.md).
When a gesture starts, based on the position where the finger was placed, a set of handlers that may be interested in recognizing the gesture is selected.
All the touch events (touch down, move, up, or when other fingers are placed or lifted) are delivered to all of the handlers selected initially.
When one gesture becomes [active](state.md#active), it cancels all the other gestures (read more about how to influence this process in ["Cross handler interactions"](interactions.md) section).

Gesture handler components do not instantiate a native view in the view hierarchy. Instead, they are kept in library's own registry and are only connected to native views. When using any of the gesture handler components, it is important for it to have a native view rendered as a child.
Since handler components don't have corresponding views in the hierarchy, the events registered with them are actually hooked into the underlying view.

### Available gesture handlers

Currently, the library provides the following list of gestures. Their parameters and attributes they provide to gesture events are documented under each gesture page:

- [`PanGestureHandler`](handler-pan.md)
- [`TapGestureHandler`](handler-tap.md)
- [`LongPressGestureHandler`](handler-longpress.md)
- [`RotationGestureHandler`](handler-rotation.md)
- [`FlingGestureHandler`](handler-fling.md)
- [`PinchGestureHandler`](handler-pinch.md)
- [`ForceTouchGestureHandler`](handler-force.md)

### Discrete vs continuous

We distinguish two types of gestures: discrete and continuous.

Continuous gesture handlers can be [active](state.md#active) for a long period of time and will generate a stream of [gesture events](handler-common.md#ongestureevent) until the gesture is [over](state.md#ended).
An example of continuous handler is [`PanGestureHandler`](handler-pan.md) that once [activated](state.md#active), will start providing updates about [translation](handler-pan.md#translationx) and other properties.

On the other hand, discrete gesture handlers once [activated](state.md#active) will not stay in the active state but will [end](state.md#ended) immediately.
[`LongPressGestureHandler`](handler-longpress.md) is a discrete handler, as it only detects if the finger is placed for a sufficiently long period of time, it does not track finger movements (as that's the responsibility of [`PanGestureHandler`](handler-pan.md)).

Keep in mind that `onGestureEvent` is only generated in the continous gesture handlers and you shouldn't use it in the `TapGestureHandler` and others discrete handlers.

### Nesting handlers

Handlers component can be nested. In any case it is recommended that the innermost handler renders a native view component. There are some limitations that apply when [using `useNativeDriver` flag](#events-with-usenativedriver). An example of nested handlers:

```js
class Multitap extends Component {
  render() {
    return (
      <LongPressGestureHandler
        onHandlerStateChange={this._onLongpress}
        minDurationMs={800}>
        <TapGestureHandler
          onHandlerStateChange={this._onSingleTap}
          waitFor={this.doubleTapRef}>
          <TapGestureHandler
            ref={this.doubleTapRef}
            onHandlerStateChange={this._onDoubleTap}
            numberOfTaps={2}>
            <View style={styles.box} />
          </TapGestureHandler>
        </TapGestureHandler>
      </LongPressGestureHandler>
    );
  }
}
```

### Using native components

Gesture handler library exposes a set of components normally available in React Native that are wrapped in [`NativeViewGestureHandler`](handlers.md).
Here is a list of exposed components:

- `ScrollView`
- `FlatList`
- `Switch`
- `TextInput`
- `DrawerLayoutAndroid` (**Android only**)

If you want to use other handlers or [buttons](component-buttons.mdx) nested in a `ScrollView` or you want to use [`waitFor`](handler-common.md#waitfor) property to define interaction between a handler and `ScrollView`

### Events with `useNativeDriver`

Because handler components does not instantiate native views but instead hook up under their child views when using `Animated.event` it is not supported currently for two gestures to be directly nested.
To workaround this limitation we recommend that a `<Animated.View>` component is placed in between the handlers.

Instead of doing:

```js
const PanAndRotate = () => (
  <PanGestureHandler onGestureEvent={Animated.event({ ... }, { useNativeDriver: true })}>
    <RotationGestureHandler onGestureEvent={Animated.event({ ... }, { useNativeDriver: true })}>
      <Animated.View style={animatedStyles}/>
    </RotationGestureHandler>
  </PanGestureHandler>
);
```

You need to place an `<Animated.View>` in between the handlers:

```js
const PanAndRotate = () => (
  <PanGestureHandler onGestureEvent={Animated.event({ ... }, { useNativeDriver: true })}>
    <Animated.View>
      <RotationGestureHandler onGestureEvent={Animated.event({ ... }, { useNativeDriver: true })}>
        <Animated.View style={animatedStyles}/>
      </RotationGestureHandler>
    </Animated.View>
  </PanGestureHandler>
);
```

Another consequence of the fact that events are hooked into the children node is that when using `useNativeDriver` flag with `Animated.event` the children node needs to be a view wrapped by `Animated.API` e.g. `<Animated.View>` instead of a `<View>`:

```js
class Draggable extends Component {
  render() {
    return (
      <PanGestureHandler onGestureEvent={Animated.event({ ... }, { useNativeDriver: true })}>
        <Animated.View style={animatedStyles} /> {/* <-- NEEDS TO BE Animated.View */}
      </PanGestureHandler>
    );
  }
};
```
