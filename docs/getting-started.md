---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Gesture handler aims at replacing React Native's built in touch system called a [JS Responder System](http://facebook.github.io/react-native/docs/gesture-responder-system.html).

The motivations for building this library were to address performance limitations of the responder system and to provide more control over the built in native components that can handle gestures.
We recommend [this talk](https://www.youtube.com/watch?v=V8maYc4R2G0) by [Krzysztof Magiera](https://twitter.com/kzzzf) where the issues with the responder system are explained.

Here is what the library provides in a nutshell:
 - A way to use platform native touch handling system for recognizing pinch, rotation and pan (and few other type of gestures).
 - You can define relations between gesture handlers, e.g. when you have pan handler in `ScrollView` you can make that `ScrollView` wait until it knows pan won't recognize.
 - You can use touchables that run in native thread and follow platform default behavior. E.g. in case they are in a scrollable component turning into pressed state is slightly delayed to prevent it from highlighting when you fling.
 - You can implement smooth gesture interactions thanks to Animated Native Driver &mdash; interactions will be responsive even when JS thread is overloaded.


## Installation

As library uses native support for handling gestures it requires custom installation.

### With [React Native](http://facebook.github.io/react-native/) app (no Expo)
#### Requirements
In order to install the newest version of a library it's requires to use v0.50+ of [React Native](http://facebook.github.io/react-native/).

Mind that if your wish to use [`React.createRef()`](https://reactjs.org/docs/refs-and-the-dom.html) support for  [interactions](interactions.md) you need to use v.16.3 of [React](https://reactjs.org/)


#### JS
First install the library from npm repository using `yarn`:
```bash
  yarn add react-native-gesture-handler
```

or using `npm` if you prefer:
```bash
  npm install --save react-native-gesture-handler
```

#### Linking
```bash
  react-native link react-native-gesture-handler
```

#### Android
Follow the steps below:

If you use one of the *native navigation libraries* (e.g. [wix/react-native-navigation](https://github.com/wix/react-native-navigation)), you should follow [this separate guide](#with-wix-react-native-navigation-https-githubcom-wix-react-native-navigation) to get gesture handler library set up on Android. Ignore the rest of this step – it only applies to RN apps that use standard Android project layout.

Update your main activity (or wherever you create an instance of `ReactActivityDelegate`), so that it overrides the method responsible for creating `ReactRootView` instance. Then use a root view wrapper provided by this library:
```java
// Don't forget imports
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class MainActivity extends ReactActivity {

  // Add the following method to your main activity class
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected ReactRootView createRootView() {
        return new RNGestureHandlerEnabledRootView(MainActivity.this);
      }
    };
  }
}
```

#### iOS
There is no additional config required to be done on iOS except from what follows in the next steps.

---
Now You're all set, just run your app with `react-native run-android` or `react-native run-ios`


### With [Expo](https://expo.io)
As gesture handler is already part of Expo, there's no need to add any extra configuration. However, consider that Expo SDK could to include the newest version of the library so it might not support newest features.

### With [wix/react-native-navigation](https://github.com/wix/react-native-navigation)

If you are using native navigation library like [wix/react-native-navigation](https://github.com/wix/react-native-navigation) you need to follow a different setup for your Android app to work properly. The reason is that both native navigation libraries and Gesture Handler library need to use their own special subclasses of `ReactRootView`.

Instead of changing java code you will need to wrap every screen component using `gestureHandlerRootHOC` on the JS side. This can be done for example at the stage when you register your screens. Here is an example:

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

You can check [this example project](https://github.com/henrikra/nativeNavigationGestureHandler) to see this set up in action.

Remember that you need to wrap each screen that you use in your app with `gestureHandlerRootHOC` as with native navigation libraries each screen maps to a separate root view. It is not enough to wrap the main screen only.
