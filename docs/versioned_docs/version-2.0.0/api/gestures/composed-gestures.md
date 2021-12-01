---
id: composed-gestures
title: Composed gestures
sidebar_label: Composed gestures
---

Composed gestures (`Race`, `Simultaneous`, `Exclusive`) provide a simple way of building relations between gestures.

## Callbacks

### `onStart(callback)`

Set the `onStart` callback.
It will be called when the first composed basic gestures activates.

### `onEnd(callback)`

Set the `onEnd` callback.
It will be called when the last composed basic gesture of those that have began or activated finishes. Note that it may be called without calling `onStart` because gestures that have began but not yet activated may fail to recognize or be cancelled.
