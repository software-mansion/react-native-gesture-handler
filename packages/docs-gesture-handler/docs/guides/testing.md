---
id: testing
title: Testing with Jest
sidebar_position: 4
---

## Mocking native modules

In order to load mocks provided by RNGH add following to your jest config in `package.json`:

```json
"setupFiles": ["./node_modules/react-native-gesture-handler/jestSetup.js"]
```

Example:

```json
"jest": {
  "preset": "react-native",
  "setupFiles": ["./node_modules/react-native-gesture-handler/jestSetup.js"]
}
```

## Testing Gestures' and Gesture handlers' callbacks

RNGH provides APIs, specifically [`fireGestureHandler`](#firegesturehandler) and [`getByGestureTestId`](#getbygesturetestid), to trigger selected handlers.

### fireGestureHandler

```ts
fireGestureHandler: (componentOrGesture, eventList) => void;
```

Simulates one event stream (i.e. event sequence starting with `BEGIN` state and ending
with one of `END`/`FAIL`/`CANCEL` states), calling appropriate callbacks associated with given gesture handler.

- `componentOrGesture` - Either Gesture Handler component found by `Jest` queries (e.g. `getByTestId`) or Gesture found by [`getByGestureTestId()`](#getbygesturetestidtestid)

- `eventList` - Event data passed to appropriate callback. RNGH fills event list if required
  data is missing using these rules:
  - `oldState` is filled using state of the previous event. `BEGIN` events use
    `UNDETERMINED` value as previous event.
  - Events after first `ACTIVE` state can omit `state` field.
  - Handler specific data is filled (e.g. `numberOfTouches`, `x` fields) with
    defaults.
  - Missing `BEGIN` and `END` events are added with data copied from first and last
    passed event, respectively.
  - If first event don't have `state` field, the `ACTIVE` state is assumed.

Some `eventList` examples:

```jsx
const oldStateFilled = [
  { state: State.BEGAN },
  { state: State.ACTIVE },
  { state: State.END },
]; // three events with specified state are fired.

const implicitActiveState = [
  { state: State.BEGAN },
  { state: State.ACTIVE },
  { x: 5 },
  { state: State.END },
]; // 4 events, including two ACTIVE events (second one has overridden additional data).

const implicitBegin = [
  { x: 1, y: 11 },
  { x: 2, y: 12, state: State.FAILED },
]; // 3 events, including implicit BEGAN, one ACTIVE, and one FAILED event with additional data.

const implicitBeginAndEnd = [
  { x: 5, y: 15 },
  { x: 6, y: 16 },
  { x: 7, y: 17 },
]; // 5 events, including 3 ACTIVE events and implicit BEGAN and END events. BEGAN uses first event's additional data, END uses last event's additional data.

const allImplicits = []; // 3 events, one BEGIN, one ACTIVE, one END with defaults.
```

### getByGestureTestId

```tsx
getByGestureTestId: (testID: string) => Gesture;
```

Returns opaque data type associated with gesture. Gesture is found via [`testID`](/docs/gestures/use-pan-gesture#testid) attribute in rendered
components.

- `testID` - String identifying gesture.

:::warning
`testID` must be unique among components rendered in test.
:::

## Example

Extracted from RNGH tests, check [`api_v3.test.tsx`](https://github.com/software-mansion/react-native-gesture-handler/blob/main/packages/react-native-gesture-handler/src/__tests__/api_v3.test.tsx) for full implementation.

```tsx
test('Pan gesture', () => {
  const onBegin = jest.fn();
  const onStart = jest.fn();

  const panGesture = renderHook(() =>
    usePanGesture({
      disableReanimated: true,
      onBegin: (e) => onBegin(e),
      onActivate: (e) => onStart(e),
    })
  ).result.current;

  fireGestureHandler(panGesture, [
    { oldState: State.UNDETERMINED, state: State.BEGAN },
    { oldState: State.BEGAN, state: State.ACTIVE },
    { oldState: State.ACTIVE, state: State.ACTIVE },
    { oldState: State.ACTIVE, state: State.END },
  ]);

  expect(onBegin).toHaveBeenCalledTimes(1);
  expect(onStart).toHaveBeenCalledTimes(1);
});
```
