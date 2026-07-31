RNGH3 allows manually controlling the [gestures' lifecycle](/docs/under-the-hood/state) by using [`GestureStateManager`](#gesturestatemanager).

## State management

Manual state management is based on `handlerTag`. There are two ways of manual state control. Some gestures also support [`manualActivation`](#manualactivation) property, which blocks their automatic activation, even if they meet their activation criteria.

### Inside gesture definition

If you want to manipulate gesture's state in its callbacks, you can get `handlerTag` from event parameter.

### Outside gesture definition

If you want to control gesture lifecycle outside of it, you can use `handlerTag` from created gesture object.

> **Note**
>
> The gestures can only be activated after they have begun, that is, after they have received touch events.

### manualActivation

When `manualActivation` property is set to `true` on a gesture, it will not activate automatically even if its activation criteria are met. Use [`GestureStateManager`](#gesturestatemanager) to manipulate its state manually.

In the example below, [`Pan`](/docs/gestures/use-pan-gesture) gesture will not activate by simply panning on the blue box - using `GestureStateManager` is necessary.

## GestureStateManager

`GestureStateManager` provides methods to manipulate gesture's state imperatively.

### activate

```tsx
activate: (handlerTag: number) => void;
```

Triggers [`onActivate`](/docs/fundamentals/callbacks-events#onactivate) callback on the gesture with the specified `handlerTag`.

### deactivate

```tsx
deactivate: (handlerTag: number) => void;
```

If the gesture had activated, it triggers the [`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate) callback. It also triggers the [`onFinalize`](/docs/fundamentals/callbacks-events#onfinalize) callback on the gesture with the specified `handlerTag`.

### fail

```tsx
fail: (handlerTag: number) => void;
```

Triggers [`onFinalize`](/docs/fundamentals/callbacks-events#onfinalize) callback on the gesture with the specified `handlerTag`. If the gesture had activated, it will also trigger [`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate) callback.
