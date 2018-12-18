---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Gesture Handler aims to replace React Native's built in touch system called [Gesture Responder System](http://facebook.github.io/react-native/docs/gesture-responder-system.html).

The motivation for building this library was to address the performance limitations of React Native's Gesture Responder System and to provide more control over the built-in native components that can handle gestures.
We recommend [this talk](https://www.youtube.com/watch?v=V8maYc4R2G0) by [Krzysztof Magiera](https://twitter.com/kzzzf) in which he explains issues with the responder system.

In a nutshell, the library provides:
 - A way to use a platform's native touch handling system for recognizing pinch, rotation and pan (besides a few other gestures).
 - The ability to define relations between gesture handlers, e.g. when you have a pan handler in `ScrollView` you can make that `ScrollView` wait until it knows pan won't recognize.
 - Mechanisms to use touchables that run in native thread and follow platform default behavior; e.g. in the event they are in a scrollable component, turning into pressed state is slightly delayed to prevent it from highlighting when you fling.
 - The possibility to implement smooth gesture interactions thanks to Animated Native Driver &mdash; interactions will be responsive even when the JS thread is overloaded.


## Installation

Since the library uses native support for handling gestures, it requires an extended installation to the norm.

### With [React Native](http://facebook.github.io/react-native/) app (no Expo)
#### Requirements
In order to install the newest version of a library it's requires to use v0.50+ of [React Native](http://facebook.github.io/react-native/).

Note that if you wish to use [`React.createRef()`](https://reactjs.org/docs/refs-and-the-dom.html) support for  [interactions](interactions.md) you need to use v.16.3 of [React](https://reactjs.org/)


#### JS
First, install the library using `yarn`:
```bash
  yarn add react-native-gesture-handler
```

or with `npm` if you prefer:
```bash
  npm install --save react-native-gesture-handler
```

#### Linking
```bash
  react-native link react-native-gesture-handler
```

#### Android
Follow the steps below:

If you use one of the *native navigation libraries* (e.g. [wix/react-native-navigation](https://github.com/wix/react-native-navigation)), you should follow [this separate guide](#with-wix-react-native-navigation-https-githubcom-wix-react-native-navigation) to get gesture handler library set up on Android. Ignore the rest of this step – it only applies to RN apps that use a standard Android project layout.

Update your `MainActivity.java` file (or wherever you create an instance of `ReactActivityDelegate`), so that it overrides the method responsible for creating `ReactRootView` instance and then use the root view wrapper provided by this library. Do not forget to import `ReactActivityDelegate`, `ReactRootView`, and `RNGestureHandlerEnabledRootView`:
```diff
package com.swmansion.gesturehandler.react.example;

import com.facebook.react.ReactActivity;
+ import com.facebook.react.ReactActivityDelegate;
+ import com.facebook.react.ReactRootView;
+ import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class MainActivity extends ReactActivity {

  @Override
  protected String getMainComponentName() {
    return "Example";
  }

+  @Override
+  protected ReactActivityDelegate createReactActivityDelegate() {
+    return new ReactActivityDelegate(this, getMainComponentName()) {
+      @Override
+      protected ReactRootView createRootView() {
+       return new RNGestureHandlerEnabledRootView(MainActivity.this);
+      }
+    };
+  }
}
```

#### iOS
There is no additional configuration required on iOS except what follows in the next steps.

---
Now you're all set. Run your app with `react-native run-android` or `react-native run-ios`


### With [Expo](https://expo.io)
Gesture Handler is already part of Expo and there is no extra configuration required. However, consider that the Expo SDK team may take some time to include the newest version of the library - so Expo might not always support all our latest features as soon as they are out.

### With [wix/react-native-navigation](https://github.com/wix/react-native-navigation)

If you are using a native navigation library like [wix/react-native-navigation](https://github.com/wix/react-native-navigation) you need to follow a different setup for your Android app to work properly. The reason is that both native navigation libraries and Gesture Handler library need to use their own special subclasses of `ReactRootView`.

Instead of changing Java code you will need to wrap every screen component using `gestureHandlerRootHOC` on the JS side. This can be done for example at the stage when you register your screens. Here's an example:

```js
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { Navigation } from 'react-native-navigation';

import FirstTabScreen from './FirstTabScreen';
import SecondTabScreen from './SecondTabScreen';
import PushedScreen from './PushedScreen';

// register all screens of the app (including internal ones)
export function registerScreens() {
  Navigation.registerComponent('example.FirstTabScreen', () =>
    gestureHandlerRootHOC(FirstTabScreen));
  Navigation.registerComponent('example.SecondTabScreen', () =>
    gestureHandlerRootHOC(SecondTabScreen));
  Navigation.registerComponent('example.PushedScreen', () =>
    gestureHandlerRootHOC(PushedScreen));
}
```

You can check out [this example project](https://github.com/henrikra/nativeNavigationGestureHandler) to see this kind of set up in action.

Remember that you need to wrap each screen that you use in your app with `gestureHandlerRootHOC` as with native navigation libraries each screen maps to a separate root view. It will not be enough to wrap the main screen only.
