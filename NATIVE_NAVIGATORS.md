# Android installation for apps using native navigation libraries

If you are using native navigation library like [wix/react-native-navigation](https://github.com/wix/react-native-navigation) you need to follow a different setup for your Android app to work properly.


### Why?

The reason is that both native navigation libraries and Gesture Handler library need to use their own special subclasses of `ReactRootView`.

## Installation with `react-native-navigation`

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

**IMPORTANT!!** Remember that you need to wrap each screen that you use in you rapp with `gestureHandlerRootHOC` as with native navigation libraries each screen maps to a separate root view. It is not enough to wrap the main screen only.
