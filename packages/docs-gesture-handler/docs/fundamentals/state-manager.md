---
id: state-manager
title: State manager
sidebar_label: State manager
sidebar_position: 6
---

RNGH3 allows to manually control gestures lifecycle by using `GestureStateManager`.

## State management

Manual state management is based on `handlerTag`. There are two ways of manual state control.

### Inside gesture definition

If you want to manipulate gesture's state in its callbacks, you can get `handlerTag` from event parameter.

```tsx {3}
const longPress = useLongPressGesture({
  onTouchesDown: (e) => {
    GestureStateManager.activate(e.handlerTag);
  },
  onActivate: () => {
    console.log('LongPress activated!');
  },
});
```

### Outside gesture definition

If you want to control gesture lifecycle outside of it, you can use `tag` from created gesture object.

```tsx {9}
const longPress = useLongPressGesture({
  onActivate: () => {
    console.log('LongPress activated!');
  },
});

const pan = usePanGesture({
  onBegin: () => {
    GestureStateManager.activate(longPress.tag);
  },
});
```

## Methods

### begin

```tsx
begin: (handlerTag: number) => void;
```

Triggers [`onBegin`](/docs/fundamentals/callbacks-events#onbegin) callback on gesture with specified `handlerTag`.

### activate

```tsx
activate: (handlerTag: number) => void;
```

Triggers [`onActivate`](/docs/fundamentals/callbacks-events#onactivate) callback on gesture with specified `handlerTag`.

### deactivate

```tsx
deactivate: (handlerTag: number) => void;
```

Triggers first [`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate), then [`onFinalize`](/docs/fundamentals/callbacks-events#onfinalize) callbacks on gesture with specified `handlerTag`.

### fail

```tsx
fail: (handlerTag: number) => void;
```

Triggers [`onFinalize`](/docs/fundamentals/callbacks-events#onfinalize) callback on gesture with specified `handlerTag`. If gesture had activated, it will also trigger [`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate) callback.
