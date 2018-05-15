---
id: state
title: Handler State
sidebar_label: Handler State
---

As described in ["About Gesture Handlers"](about-handlers.md) section gesture handlers can be treated as ["state machines"](https://en.wikipedia.org/wiki/Finite-state_machine).
Each handler instance at any given time has an assigned state that can change when new touch events arrive or can be forced by the touch system to change it state in certain circumstances.

There are six possible states for the handler:
 - [UNDETERMINED](#undetermined)
 - [FAILED](#failed)
 - [BEGAN](#began)
 - [CANCELLED](#cancelled)
 - [ACTIVE](#active)
 - [END](#end)

Each state has its own section underneath describing the details.

## Accessing state

We can monitor handler's state changes using [`onHandlerStateChange`](handler-common.md#onhandlerstatechange) callback and accessed from [`state`](handler-common.md#state) attribute of the event.

The [`state`](handler-common.md#state) as provided in the event attribute can be matched agains one of the constants exported under `State` object (see the example below).
The constants corresponds

```
import { State, LongPressGestureHandler } from 'react-native-gesture-handler';

class Demo extends Component {
  _handleStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      Alert.alert('Longpress');
    }
  };
  render() {
    return (
      <LongPressGestureHandler onHandlerStateChange={this._handleStateChange}>
        <Text style={styles.buttonText}>Longpress me</Text>
      </LongPressGestureHandler>
    );
  }
}
```

## State flows

The most typical flow of the state is when the gesture handler first picks up the initial touch events, then at some point it reognizes the touches and after the end of the gesture is recognized it resets back to the initial state. The flow looks as follows (longer arrows represent that there are possibly more touch events received before the state changes):

[`UNDETERMINED`](#undetermined) -> [`BEGAN`](#began) ------> [`ACTIVE`](#active) ------> [`END`](#end) -> [`UNDETERMINED`](#undetermined)

Here is another possible flow when the handler receive touches that causes it to fail recognition:

[`UNDETERMINED`](#undetermined) -> [`BEGAN`](#began) ------> [`FAILED`](#failed) -> [`UNDETERMINED`](#undetermined)

Lastly even when the handler properly recognizes the gesture it may be interrupted by the touch system, in that case the flow looks as follows:

[`UNDETERMINED`](#undetermined) -> [`BEGAN`](#began) ------> [`ACTIVE`](#active) ------> [`CANCELLED`](#cancelled) -> [`UNDETERMINED`](#undetermined)

## States

Section below lists all the possible handler states along with detailed description of each state:

### UNDETERMINED
This is the initial state of each handler. It also changes to that state when it is done recognizing and hasn't started recogninzing another gesture.

### FAILED
Handler has received some touches, but for some condition (e.g. finger traveled too long distance when `maxDist` property is set) it won't get [activated](#ACTIVE) and gesture was not recognized. After that handler is reset to [the initial state](#undetermined).

### BEGAN
Handler has started receiving touch stream but hasn't yet receive enough data to either [fail](#failed) or [activate](#active).

### CANCELLED
The gesture recognizer has received signal (possibly new touches or a command from the touch system controller) resulting in the cancellation of a continuous gesture. Gesture recognizer is reset to [the initial state](#undetermined).

### ACTIVE
Handler has recognized gesture and will stay in the active as until the gesture finishes (normally when user lifts the finger) or get cancelled by the touch system. Under normal circumstances it would turn into [ended](#end) state. In case it is cancelled by the touch system it would turn into [CANCELLED](#cancelled) state.
Learn about [discrete and continuous handlers here](about-handlers.md#discrete-vs-continuous) to understand how long handler can be kept in the ACTIVE state.

### END
The gesture recognizer has received touches recognized as the end of the gesture. After that it will reset to [the initial state](#undetermined).
