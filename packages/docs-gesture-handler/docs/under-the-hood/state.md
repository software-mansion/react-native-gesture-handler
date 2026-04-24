---
id: state
title: Handler State
sidebar_label: Handler State
---

Gesture handlers can be treated as ["state machines"](https://en.wikipedia.org/wiki/Finite-state_machine).
At any given time, each handler instance has an assigned state that can change when new touch events occur or can be forced to change by the touch system in certain circumstances.

States manage the internal recognition process. You can hook into these transitions using specific gesture callbacks.

| State              | Description                                                                              | Callback                                                                                                                                                                                                                                                                           |
| :----------------- | :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`UNDETERMINED`** | The default initial state of every handler.                                              | —                                                                                                                                                                                                                                                                                  |
| **`BEGAN`**        | The handler has started receiving touch data but hasn't yet met the activation criteria. | [`onBegin`](/docs/fundamentals/callbacks-events#onbegin)                                                                                                                                                                                                                           |
| **`ACTIVE`**       | The gesture is recognized and activation criteria are met.                               | [`onActivate`](/docs/fundamentals/callbacks-events#onactivate) when it first transitions into the `ACTIVE` state. <br /><br /> [`onUpdate`](/docs/fundamentals/callbacks-events#onupdate) when it has new data about the gesture.                                                  |
| **`END`**          | The user successfully completed the gesture.                                             | [`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate) with `didSucceed` parameter set to `true`. <br/><br/> [`onFinalize`](/docs/fundamentals/callbacks-events#onfinalize) with `didSucceed` parameter set to `true`.                                                 |
| **`FAILED`**       | The handler failed to recognize the gesture.                                             | [`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate) if the gesture was in `ACTIVE` state before. `didSucceed` parameter will be set to `false` <br/><br/> [`onFinalize`](/docs/fundamentals/callbacks-events#onfinalize) with `didSucceed` parameter set to `false`. |
| **`CANCELLED`**    | The system interrupted the gesture.                                                      | [`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate) if the gesture was in `ACTIVE` state before. `didSucceed` parameter will be set to `false` <br/><br/> [`onFinalize`](/docs/fundamentals/callbacks-events#onfinalize) with `didSucceed` parameter set to `false`. |
