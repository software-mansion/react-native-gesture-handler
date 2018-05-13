---
id: state
title: Handler State
sidebar_label: Handler State
---

Library exports a `State` object that provides a number of constants used to express the state of the handler. States were inspired by [UIGestureRecognizerState](https://developer.apple.com/documentation/uikit/uigesturerecognizerstate), but represent a bit different flow of changes gesture's recognition steps. 
States are used in native event's callback `onHandlerStateChange` and represents current state of gesture.
Here are the available predefined states:


### UNDETERMINED
The gesture recognizer has not yet recognized its gesture, but may be evaluating touch events. This is the default state.

### FAILED
Handler has received some touches, but for some condition (e.g. finger traveled too long distance when `maxDist` property is set) it won't get [activated](#ACTIVE) and gesture was not recognized. Gesture recognizer is reset to [initial state](#undetermined)

### BEGAN
Handler has initiated recognition but have not enough data to tell if it has recognized or not.

### CANCELLED
The gesture recognizer has received touches resulting in the cancellation of a continuous gesture. Gesture recognizer is reset to [initial state](#undetermined)

### ACTIVE
Handler has recognized gesture and provide proper action. Gesture will be active as long as finger is on the screen and every custom conditions are met. Then it will [end](#end).

### END
The gesture recognizer has received touches recognized as the end of gesture. 
