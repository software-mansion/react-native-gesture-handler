---
id: installation
title: Installation
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Requirements

`react-native-gesture-handler` supports the three latest minor releases of `react-native`.

| version | `react-native` version |
| ------- | ---------------------- |
| 2.24.0+ | 0.75.0+                |
| 2.21.0+ | 0.74.0+                |
| 2.18.0+ | 0.73.0+                |
| 2.16.0+ | 0.68.0+                |
| 2.14.0+ | 0.67.0+                |
| 2.10.0+ | 0.64.0+                |
| 2.0.0+  | 0.63.0+                |

In order to fully utilize the [touch events](/docs/gestures/touch-events/) you also need to use `react-native-reanimated` 2.3.0 or newer.

Setting up `react-native-gesture-handler` is pretty straightforward:

### 1. Start with installing the package from npm:

<Tabs groupId="package-managers">
  <TabItem value="expo" label="EXPO" default>

    npx expo install react-native-gesture-handler

  </TabItem>
  <TabItem value="npm" label="NPM">

    npm install react-native-gesture-handler

  </TabItem>
  <TabItem value="yarn" label="YARN">

    yarn add react-native-gesture-handler

  </TabItem>
</Tabs>

### 2. Wrap your app with `GestureHandlerRootView` component

```jsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView>
      <ActualApp />
    </GestureHandlerRootView>
  );
}
```

If you don't provide anything to the `styles` prop, it will default to `flex: 1`. If you want to customize the styling of the root view, don't forget to also include `flex: 1` in the custom style, otherwise your app won't render anything. Keep `GestureHandlerRootView` as close to the actual root of the app as possible. It's the entry point for all gestures and all gesture relations. The gestures won't be recognized outside of the root view, and relations only work between gestures mounted under the same root view.

If you're unsure if one of your dependencies already renders `GestureHandlerRootView` on its own, don't worry and add one at the root anyway. In case of nested root views, Gesture Handler will only use the top-most one and ignore the nested ones.

:::tip
If you're using gesture handler in your component library, you may want to wrap your library's code in the `GestureHandlerRootView` component. This will avoid extra configuration for the user.
:::

### 3. Platform specific setup

#### [Expo development build](https://docs.expo.dev/develop/development-builds/introduction/)

When using an Expo development build, run prebuild to update the native code in the ios and android directories.

```bash
npx expo prebuild
```

#### Android

Setting up Gesture Handler on Android doesn't require any more steps. Keep in mind that if you want to use gestures in Modals you need to wrap Modal's content with `GestureHandlerRootView`:

```jsx
import { Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export function CustomModal({ children, ...rest }) {
  return (
    <Modal {...rest}>
      <GestureHandlerRootView>
        {children}
      </GestureHandlerRootView>
    </Modal>
  );
}
```


##### Kotlin

Gesture Handler on Android is implemented in Kotlin. If you need to set a specific Kotlin version to be used by the library, set the `kotlinVersion` ext property in `android/build.gradle` file and RNGH will use that version:

```groovy
buildscript {
    ext {
        kotlinVersion = "1.6.21"
    }
}
```

#### iOS

While developing for iOS, make sure to install [pods](https://cocoapods.org/) first before running the app:

```bash
cd ios && pod install && cd ..
```

#### Web

There is no additional configuration required for the web, however, since the Gesture Handler 2.10.0 the new web implementation is enabled by default. We recommend you to check if the gestures in your app are working as expected since their behavior should now resemble the native platforms. If you don't want to use the new implementation, you can still revert back to the legacy one by enabling it at the beginning of your `index.js` file:

```js
import { enableLegacyWebImplementation } from 'react-native-gesture-handler';

enableLegacyWebImplementation(true);
```

Nonetheless, it's recommended to adapt to the new implementation, as the legacy one will be dropped in the next major release of Gesture Handler.

#### With [wix/react-native-navigation](https://github.com/wix/react-native-navigation)

If you are using a native navigation library like [wix/react-native-navigation](https://github.com/wix/react-native-navigation) you need to make sure that every screen is wrapped with `GestureHandlerRootView` (you can do this using `gestureHandlerRootHOC` function). This can be done for example at the stage when you register your screens. Here's an example:

```js
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Navigation } from 'react-native-navigation';
import FirstTabScreen from './FirstTabScreen';
import SecondTabScreen from './SecondTabScreen';
import PushedScreen from './PushedScreen';
// register all screens of the app (including internal ones)
export function registerScreens() {
  Navigation.registerComponent(
    'example.FirstTabScreen',
    () => gestureHandlerRootHOC(FirstTabScreen),
    () => FirstTabScreen
  );
  Navigation.registerComponent(
    'example.SecondTabScreen',
    () => gestureHandlerRootHOC(SecondTabScreen),
    () => SecondTabScreen
  );
  Navigation.registerComponent(
    'example.PushedScreen',
    () => gestureHandlerRootHOC(PushedScreen),
    () => PushedScreen
  );
}
```

You can check out [this example project](https://github.com/henrikra/nativeNavigationGestureHandler) to see this kind of set up in action.

Remember that you need to wrap each screen that you use in your app with `GestureHandlerRootView` (you can do this using `gestureHandlerRootHOC` function) as with native navigation libraries each screen maps to a separate root view. It will not be enough to wrap the main screen only.
