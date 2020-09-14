---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
slug: /
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

### Managed [Expo](https://expo.io)

To use the version of react-native-gesture-handler that is compatible with your managed Expo project, run `expo install react-native-gesture-handler`.

The Expo SDK incorporates the latest version of react-native-gesture-handler available at the time of each SDK release, so managed Expo apps might not always support all our latest features as soon as they are available.

### Bare [React Native](http://facebook.github.io/react-native/)

Since the library uses native support for handling gestures, it requires an extended installation to the norm. If you are starting a new project, you may want to initialize it with [expo-cli](https://docs.expo.io/versions/latest/workflow/expo-cli/) and use a bare template, they come pre-installed with react-native-gesture-handler.

#### Requirements

| version   | `react-native` version |
| --------- | ---------------------- |
| 1.4.0+    | 0.60.0+                |
| 1.1.0+    | 0.57.2+                |
| &lt;1.1.0 | 0.50.0+                |

Note that if you wish to use [`React.createRef()`](https://reactjs.org/docs/refs-and-the-dom.html) support for [interactions](interactions.md) you need to use v16.3 of [React](https://reactjs.org/)

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

> **Important**: You only need to do this step if you're using React Native 0.59 or lower. Since v0.60, linking happens automatically.

```bash
react-native link react-native-gesture-handler
```

#### Android

Follow the steps below:

If you use one of the _native navigation libraries_ (e.g. [wix/react-native-navigation](https://github.com/wix/react-native-navigation)), you should follow [this separate guide](#with-wix-react-native-navigation-https-githubcom-wix-react-native-navigation) to get gesture handler library set up on Android. Ignore the rest of this step – it only applies to RN apps that use a standard Android project layout.

##### Updating `MainActivity.java`

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

##### Running jetifier

> **Important:** You only need to do this step if you're on React Native 0.60 or greater.

React Native 0.60 migrated from Support Library to AndroidX. React Native Gesture Handler is not yet compatible with AndroidX.

Make sure to [update the React Native CLI to the latest version](https://github.com/react-native-community/cli/tree/master#updating-the-cli) which runs [`jetifier`](https://www.npmjs.com/package/jetifier) – the AndroidX migration tool – during the `run-android` command.

#### iOS

There is no additional configuration required on iOS except what follows in the next steps.

If you're in a CocoaPods project (the default setup since React Native 0.60),
make sure to install pods before you run your app:

```sh
cd ios && pod install
```

For React Native 0.61 or greater, add the library as the first import in your index.js file:

```
import 'react-native-gesture-handler';
```

Now you're all set. Run your app with `react-native run-android` or `react-native run-ios`.

### With [wix/react-native-navigation](https://github.com/wix/react-native-navigation)

If you are using a native navigation library like [wix/react-native-navigation](https://github.com/wix/react-native-navigation) you need to follow a different setup for your Android app to work properly. The reason is that both native navigation libraries and Gesture Handler library need to use their own special subclasses of `ReactRootView`.

Instead of changing Java code you will need to wrap every screen component using `gestureHandlerRootHOC` on the JS side. This can be done for example at the stage when you register your screens. Here's an example:

```js
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Navigation } from 'react-native-navigation';

import FirstTabScreen from './FirstTabScreen';
import SecondTabScreen from './SecondTabScreen';
import PushedScreen from './PushedScreen';

// register all screens of the app (including internal ones)
export function registerScreens() {
  Navigation.registerComponent('example.FirstTabScreen', () =>
    gestureHandlerRootHOC(FirstTabScreen)
  );
  Navigation.registerComponent('example.SecondTabScreen', () =>
    gestureHandlerRootHOC(SecondTabScreen)
  );
  Navigation.registerComponent('example.PushedScreen', () =>
    gestureHandlerRootHOC(PushedScreen)
  );
}
```

You can check out [this example project](https://github.com/henrikra/nativeNavigationGestureHandler) to see this kind of set up in action.

Remember that you need to wrap each screen that you use in your app with `gestureHandlerRootHOC` as with native navigation libraries each screen maps to a separate root view. It will not be enough to wrap the main screen only.

### Usage with modals on Android

On Android RNGH does not work by default because modals are not located under React Native Root view in native hierarchy.
In order to make it workable, components need to be wrapped with `gestureHandlerRootHOC` (it's no-op on iOS and web).

E.g.

```js
const ExampleWithHoc = gestureHandlerRootHOC(function GestureExample() {
  return (
    <View>
      <DraggableBox />
    </View>
  );
});

export default function Example() {
  return (
    <Modal animationType="slide" transparent={false}>
      <ExampleWithHoc />
    </Modal>
  );
}
```

### For library authors

If you're using gesture handler in your component library, you may want to wrap your library's code in the `GestureHandlerRootView` component. This will avoid extra configuration in `MainActivity.java` for the user.

```js
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default MyComponent() {
  return (
    <GestureHandlerRootView>
      {/* content */}
    </GestureHandlerRootView>
  )
}
```

If you use props such as `shouldCancelWhenOutside`, `simultaneousHandlers`, `waitFor` etc. with gesture handlers, the handlers need to be mounted under a single `GestureHandlerRootView`. So it's important to keep the `GestureHandlerRootView` as close to the actual root view as possible.

Note that `GestureHandlerRootView` acts like a normal `View`. So if you want it to fill the screen, you will need to pass `{ flex: 1 }` like you'll need to do with a normal `View`. By default, it'll take the size of the content nested inside.

### Testing

In order to load mocks provided by the library add following to your jest config in `package.json`:

```json
"setupFiles": ["./node_modules/react-native-gesture-handler/jestSetup.js"]
```

Example:

```json
"jest": {
  "preset": "react-native",
  "setupFiles": ["./node_modules/react-native-gesture-handler/jestSetup.js"]
}
```
