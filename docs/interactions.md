---
id: interactions
title: Gesture Handlers interactions
---

Gesture handler library API allows for defining some basic interaction between handler components. Interactions can be defined by first setting a string identifer for a handler component with the `id` property and then referencing it with `waitFor` or `simultaneousHandlers` props in other handler component.

#### `waitFor` property

This property accepts one or more gesture handler IDs (either as a single string or an array of strings). If this property is set, the gesture handler will wait for the provided handlers to fail before it can activate.

#### `simultaneousHandlers` property

This property accepts one or more gesture handler IDs (either as a single string or an array of strings). Setting this property will make the gesture handler recognize a gesture simultaneously with handlers with provided IDs. Typical use case would be a map component, for which we want both pinch and rotate gestures to be recognized simultaneously.
