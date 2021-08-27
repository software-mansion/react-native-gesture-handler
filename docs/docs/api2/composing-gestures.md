---
id: composing-gestures
title: Composing gestures
sidebar_label: Composing gestures
---

Composing gestures is much simpler in RNGH2, you don't need to create a ref for every gesture that depends on another one. Instead you can use `Exclusive`, `Simultaneous` and `RequireToFail` methods provided by the `Gesture` object.

## Exclusive

Is the equivalent to just having more than one gesture handler without defining `simultaneousHandlers` and `waitFor` props. It means that only one of the provided gestures can become active at the same time. It accepts variable number of arguments.

## Simultaneous

It accepts 2 arguments and it is the equivalent to having two gesture handlers, each with `simultaneousHandlers` prop set to the other handler.

## RequireToFail

It accepts 2 arguments and it is equivalent to having two gesture handlers where the first one has the `waitFor` prop set to the other handler. We hope that the changed name will be less ambigous than `waitFor`, which could be interpreted both as `wait for other handler to fail` or `wait for other handler to activate`.
