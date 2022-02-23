---
id: installation
title: Installation
---

## Requirements

| version   | `react-native` version |
| --------- | ---------------------- |
| 1.4.0+    | 0.60.0+                |
| 1.1.0+    | 0.57.2+                |
| &lt;1.1.0 | 0.50.0+                |

It may be possible to use newer versions of react-native-gesture-handler on React Native with version <= 0.59 by reverse Jetifying.
Read more on that here https://github.com/mikehardy/jetifier#to-reverse-jetify--convert-node_modules-dependencies-to-support-libraries

Note that if you wish to use [`React.createRef()`](https://reactjs.org/docs/refs-and-the-dom.html) support for [interactions](./gesture-handlers/basics/interactions.md) you need to use v16.3 of [React](https://reactjs.org/)

In order to fully utilize the [touch events](./api/gestures/touch-events.md) you also need to use `react-native-reanimated` 2.3.0-beta.4 or newer.

## Expo

### Managed [Expo](https://expo.io)

To use the version of react-native-gesture-handler that is compatible with your managed Expo project, run `expo install react-native-gesture-handler`.

The Expo SDK incorporates the latest version of react-native-gesture-handler available at the time of each SDK release, so managed Expo apps might not always support all our latest features as soon as they are available.

### Bare [React Native](http://facebook.github.io/react-native/)

Since the library uses native support for handling gestures, it requires an extended installation to the norm. If you are starting a new project, you may want to initialize it with [expo-cli](https://docs.expo.io/versions/latest/workflow/expo-cli/) and use a bare template, they come pre-installed with react-native-gesture-handler.

## JS

First, install the library using `yarn`:

```bash
yarn add react-native-gesture-handler
```

or with `npm` if you prefer:

```bash
npm install --save react-native-gesture-handler
```

After installation, wrap your entry point with `<GestureHandlerRootView>` or
`gestureHandlerRootHOC`.

For example:

```js
export default function App() {
  return <GestureHandlerRootView>{/* content */}</GestureHandlerRootView>;
}
```

:::info
If you use props such as `shouldCancelWhenOutside`, `simultaneousHandlers`, `waitFor` etc. with gesture handlers, the handlers need to be mounted under a single `GestureHandlerRootView`. So it's important to keep the `GestureHandlerRootView` as close to the actual root view as possible.

Note that `GestureHandlerRootView` acts like a normal `View`. So if you want it to fill the screen, you will need to pass `{ flex: 1 }` like you'll need to do with a normal `View`. By default, it'll take the size of the content nested inside.
:::

:::tip
If you're using gesture handler in your component library, you may want to wrap your library's code in the GestureHandlerRootView component. This will avoid extra configuration for the user.
:::

### Linking

> **Important**: You only need to do this step if you're using React Native 0.59 or lower. Since v0.60, linking happens automatically.

```bash
react-native link react-native-gesture-handler
```

## Android

### Usage with modals on Android

On Android RNGH does not work by default because modals are not located under React Native Root view in native hierarchy.
To fix that, components need to be wrapped with `gestureHandlerRootHOC` (it's no-op on iOS and web).

For example:

```js
const ExampleWithHoc = gestureHandlerRootHOC(() => (
    <View>
      <DraggableBox />
    </View>
  );
);

export default function Example() {
  return (
    <Modal>
      <ExampleWithHoc />
    </Modal>
  );
}
```

### Kotlin

Since version `2.0.0` RNGH has been rewritten with Kotlin. The default version of the Kotlin plugin used in this library is `1.5.20`.

If you need to use a different Kotlin version, set the `kotlinVersion` ext property in `android/build.gradle` file and RNGH will use that version:

```
buildscript {
    ext {
        ...
        kotlinVersion = "1.5.20"
    }
}
```

The minimal version of the Kotlin plugin supported by RNGH is `1.4.10`.

## iOS

There is no additional configuration required on iOS except what follows in the next steps.

If you're in a CocoaPods project (the default setup since React Native 0.60),
make sure to install pods before you run your app:

```bash
cd ios && pod install
```

For React Native 0.61 or greater, add the library as the first import in your index.js file:

```js
import 'react-native-gesture-handler';
```
