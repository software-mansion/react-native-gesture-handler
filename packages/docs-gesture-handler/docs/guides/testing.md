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

RNGH provides an API for triggering selected handlers:

- [`fireGestureHandler(gestureOrHandler, eventList)`](/docs/guides/testing#firegesturehandlergestureorhandler-eventlist)
- [`getByGestureTestId(testID)`](/docs/guides/testing#getbygesturetestidtestid)

## fireGestureHandler(gestureOrHandler, eventList)

Simulates one event stream (i.e. event sequence starting with `BEGIN` state and ending
with one of `END`/`FAIL`/`CANCEL` states), calling appropriate callbacks associated with given gesture handler.

### Arguments

#### `gestureOrHandler`

Represents either:

1. Gesture handler component found by Jest queries (e.g. `getByTestId`)
2. Gesture found by [`getByGestureTestId()`](/docs/guides/testing#getbygesturetestidtestid)

#### `eventList`

Event data passed to appropriate callback. RNGH fills event list if required
data is missing using these rules:

1. `oldState` is filled using state of the previous event. `BEGIN` events use
   `UNDETERMINED` value as previous event.
2. Events after first `ACTIVE` state can omit `state` field.
3. Handler specific data is filled (e.g. `numberOfTouches`, `x` fields) with
   defaults.
4. Missing `BEGIN` and `END` events are added with data copied from first and last
   passed event, respectively.
5. If first event don't have `state` field, the `ACTIVE` state is assumed.

Some examples:

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

### Example

Extracted from RNGH tests, check `Events.test.tsx` for full implementation.

```tsx
it('sends events with additional data to handlers', () => {
  const panHandlers = mockedEventHandlers();
  render(<SingleHandler handlers={panHandlers} treatStartAsUpdate />);
  fireGestureHandler<PanGesture>(getByGestureTestId('pan'), [
    { state: State.BEGAN, translationX: 0 },
    { state: State.ACTIVE, translationX: 10 },
    { translationX: 20 },
    { translationX: 20 },
    { state: State.END, translationX: 30 },
  ]);

  expect(panHandlers.active).toHaveBeenCalledTimes(3);
  expect(panHandlers.active).toHaveBeenLastCalledWith(
    expect.objectContaining({ translationX: 20 })
  );
});
```

## getByGestureTestId(testID)

Returns opaque data type associated with gesture. Gesture is found via `testID` attribute in rendered
components (see [`withTestID` method](/docs/gestures/use-pan-gesture#testid)).

### Arguments

#### `testID`

String identifying gesture.

### Notes

`testID` must be unique among components rendered in test.

### Example

See above example for `fireGestureHandler`.
