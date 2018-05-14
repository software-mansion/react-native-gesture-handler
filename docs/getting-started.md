---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Gesture handler aims at replacing React Native's built in touch system called a [JS Responder System](http://facebook.github.io/react-native/docs/gesture-responder-system.html).

The library came to live to fix some performance limitations of the responder system and also to provide more control over the native components that can also handle gestures.
We recommend [this talk](https://www.youtube.com/watch?v=V8maYc4R2G0) by [Krzysztof Magiera](https://twitter.com/kzzzf) where the limitations are explained.

Here is what the library provides in a nutshell:
 - Way to use platform native touch handling system for recognizing pinch, rotation and pan (and few other type of gestures).
 - You can define relations between gesture handlers, e.g. when you have pan handler in `ScrollView` you can make that `ScrollView` wait until it knows pan won't recognize.
 - You can use touchables that run in native thread and follow platform default behavior. E.g. in case they are in a scrollable component turning into pressed state is slightly delayed to prevent it from highlighting when you fling.
 - You can implement smooth gesture interactions that thanks to Animated Native Driver. Interations will be responsive even when JS thread is overloaded.


## Installation

<TODO>

### With [Expo](https://expo.io)

<TODO>

### With [React Native](http://facebook.github.io/react-native/) app (no Expo)

### With [wix/react-native-navigation](https://github.com/wix/react-native-navigation)