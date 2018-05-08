---
id: about
title: About Library
---

Native performance touch gestures in React Native apps!

This library provides an API that exposes mobile platform specific native capabilities of touch & gesture handling and recognition. It allows for defining complex gesture handling and recognition logic that runs 100% in native thread and is therefore deterministic.

This library is still in early development phase – but it is already useful. Our ultimate goal is to merge it into React Native core – for now, it is included in [Expo](https://expo.io).

### What does it give me:
 - It provides a way to access native touch handling logic for recognizing pinch, rotation and pan (among others)
 - You can define relations between gesture handlers, e.g. when you have pan handler in `ScrollView` you can make `ScrollView` to wait until it knows pan won't recognize
 - You can use touchables that run in native and follow platform default behaviour in case when they are embbeded in scrollable component (the interaction is slightly delayed to prevent button from highlighting when you fling)
 - You can implement smooth gesture interactions that thanks to Animated Native Driver can run even when JS thread is overloaded
