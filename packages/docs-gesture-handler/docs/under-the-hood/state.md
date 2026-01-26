---
id: state
title: Handler State
sidebar_label: Handler State
---

Gesture handlers can be treated as ["state machines"](https://en.wikipedia.org/wiki/Finite-state_machine).
At any given time, each handler instance has an assigned state that can change when new touch events occur or can be forced to change by the touch system in certain circumstances.

States manage the internal recognition process. You can hook into these transitions using specific gesture callbacks.

| State              | Description                                                                              | Callback                                                                                                                            |
| :----------------- | :--------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **`UNDETERMINED`** | The default initial state of every handler.                                              | —                                                                                                                                   |
| **`BEGAN`**        | The handler has started receiving touch data but hasn't yet met the activation criteria. | [`onBegin`](/docs/fundamentals/callbacks-events#onbegin)                                                                            |
| **`ACTIVE`**       | The gesture is recognized and activation criteria are met.                               | [`onActivate`](/docs/fundamentals/callbacks-events#onactivate) / [`onUpdate`](/docs/fundamentals/callbacks-events#onupdate)         |
| **`END`**          | The user successfully completed the gesture.                                             | [`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate)                                                                  |
| **`FAILED`**       | The handler failed to recognize the gesture.                                             | ([`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate)) [`onFinalize`](/docs/fundamentals/callbacks-events#onfinalize) |
| **`CANCELLED`**    | The system interrupted the gesture.                                                      | ([`onDeactivate`](/docs/fundamentals/callbacks-events#ondeactivate)) [`onFinalize`](/docs/fundamentals/callbacks-events#onfinalize) |
