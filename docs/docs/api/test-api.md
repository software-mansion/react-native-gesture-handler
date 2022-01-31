---
id: test-api
title: Testing
---

## fireGestureHandler(gestureOrHandler, eventList)

Simulates one event stream (i.e. event sequence starting with BEGIN state and ending
with one of END/FAIL/CANCEL states), calling appropriate callbacks associated with given gesture handler.

### Arguments

#### `gestureOrHandler`

Represents either:

1. Gesture handler component found by Jest queries (e.g. `getByTestId`)
2. Gesture found by [`getByGestureId()`](#getbygestureidtestid)

#### `eventList`

Event data passed to appropriate callback. RNGH fills event list if required
data is missing using these rules:

1. `oldState` is filled using state of the previous event. BEGIN events use
   UNDETERMINED value as previous event.
2. Events after first ACTIVE state can omit `state` field.
3. Handler specific data is filled (e.g. `numberOfTouches`, `x` fields) with
   defaults.
4. Missing BEGIN and END events are added with data copied from first and last
   passed event, respectively.
5. If first event don't have `state` field, BEGIN state for discrete handlers and
   ACTIVE state for continuous handlers is assumed.

Some examples:

TODO(jgonet) - some examples

TODO(jgonet) - links to discrete and continuous handlers list

### Example

TODO(jgonet) - link to test in repo and excerpt from it

## getByGestureId(testID)

Returns opaque data type associated with gesture. Gesture is found via `testID` attribute in rendered
components (see `withTestID` method).

### Arguments

#### `testID`

String identifying gesture.

### Notes

`testID` must be unique among components rendered in test.

### Example

TODO(jgonet) - link to test in repo and excerpt from it
