---
id: whats-new
title: What's new in 2.0
sidebar_label: What's new in 2.0
---

RNGH2 introduces a new way of creating gestures. Instead of creating a gesture handler component for every gesture you want to create, you just need to create a `GestureDetector` component and assign to it all the gestures you want it to recognize. It is also designed to work seamlessly with `Reanimated 2` and it will automatically detect if it is installed, and start using it if it is.
You can create gestures using the `Gesture` object and methods it provides, and configure them in the builder-like pattern. If you want to specify behavior between the gestures instead of using `waitFor` and `simultaneousGestures` you can use the new system of [gesture composition](./gesture-composition).
Along the new API, version 2.0 brings one of the most requested features: [pointer events and manual gestures](./manual-gestures/manual-gestures). Thanks to great work done by the Reanimated team, we were able to provide synchronous communication between gestures and their native implementation using worklets. This allows to manage gesture state from the JS without risking race-conditions.

### Interoperability with gesture handlers

The new API with gestures is somewhat compatible with the old gesture handlers. Unfortunately you cannot use the new gesture composing with gesture handlers, however you can still mark relations using refs. If you want to make a gesture handler wait for (or simultaneous with) a gesture, simply use withRef method on the gesture to set the ref object and pass it to the appropriate property on the gesture handler.

Similarly, if you want to make a gesture simultaneous with (or wait for failure of) a gesture handler, set the ref prop of the gesture handler and pass the same ref to the simultaneousWithExternalGesture or requireExternalGestureToFail method on the gesture object.

This should allow you to migrate your codebase from the gesture handlers to gestures smoothly and at your own pace. Just keep in mind that the gesture handlers cannot have the GestureDetector as their direct child, as it's a functional component.
