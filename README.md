# react-native-gesture-handler

Native performance touch gestures in React Native apps!

This library provides an API that exposes mobile platform specific native capabilities of touch & gesture handling and recognition. It allows for defining complex gesture handling and recognition logic that runs 100% in native thread and is therefore deterministic.

This library is still in early development phase – but it is already useful. Our ultimate goal is to merge it into React Native core – for now, it is included in [Expo](https://expo.io).

### What does it give me:
 - It provides a way to access native touch handling logic for recognizing pinch, rotation and pan (among others)
 - You can define relations between gesture handlers, e.g. when you have pan handler in `ScrollView` you can make `ScrollView` to wait until it knows pan won't recognize
 - You can use touchables that run in native and follow platform default behaviour in case when they are embbeded in scrollable component (the interaction is slightly delayed to prevent button from highlighting when you fling)
 - You can implement smooth gesture interactions that thanks to Animated Native Driver can run even when JS thread is overloaded

## Installation

### Supported configurations

Before instaling please check the following table to find which library version is compatible with React Native version you are using:

 | React Native version | React Native Gesture Handler version | Notes |
 | --- | --- | --- |
 | v0.50+ | **latest** | |
 | v0.47 - v0.49 | 1.0.0-alpha.29 | Breaking changes explained and fixed in [#44](https://github.com/kmagiera/react-native-gesture-handler/pull/44) |
 | pre v0.47 | **Not supported** |



I. First install the library from npm repository using `yarn`:
```bash
  yarn add react-native-gesture-handler
```

or using `npm` if you prefer:
```bash
  npm install --save react-native-gesture-handler
```

II. Run:
```bash
  react-native link react-native-gesture-handler
```

III (**Android**). Follow the steps below:

**IMPORTANT:** If you use one of the *native navigation libraries* (e.g. [wix/react-native-navigation](https://github.com/wix/react-native-navigation)), you should follow [this separate guide](NATIVE_NAVIGATORS.md) to get gesture handler library set up on Android. Ignore the rest of this step – it only applies to RN apps that use standard Android project layout.

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

III (**iOS**). There is no additional config required to be done on iOS except from what follows in the next steps.

IV. You're all set, just run your app with `react-native run-android` or `react-native run-ios`

## Examples

If you want to play with the API but don't feel like trying it on a real app, you can run the example project. Clone the repo, go to the `Example/` folder and run:
```bash
  yarn install
```

Then run `react-native run-android` or `react-native run-ios` (depending on which platform you want to run the example app on).

You will need to have an Android or iOS device or emulator connected as well as `react-native-cli` package installed globally.

## API

Here are a gesture recognizers currently available in the package:
 - `TapGestureHandler`
 - `LongPressGestureHandler`
 - `PanGestureHandler`
 - `PinchGestureHandler`
 - `RotationGestureHandler`

Whenever you use a native component that should handle touch events you can either wrap it with `NativeViewGestureHandler` or import wrapper component exported by the library instead of importing it from `react-native` package. Here is the list of available components:
 - `ScrollView`
 - `Slider`
 - `Switch`
 - `TextInput`
 - `ToolbarAndroid` (**Android only**)
 - `ViewPagerAndroid` (**Android only**)
 - `DrawerLayoutAndroid` (**Android only**)
 - `WebView`


Library exports a `State` object that provides a number of constants used to express the state of the handler. Here are the available constants:
 - `State.UNDETERMINED` - default and initial state
 - `State.FAILED` - handler failed recognition of the gesture
 - `State.BEGAN` - handler has initiated recognition but have not enough data to tell if it has recognized or not
 - `State.CANCELLED` - handler has been cancelled because of other handler (or a system) stealing the touch stream
 - `State.ACTIVE` - handler has recognized
 - `State.END` - gesture has completed

#### Common `GestureHandler` properties

 - `id`
 - `enabled`
 - `shouldCancelWhenOutside`
 - `simultaneousHandlers`
 - `waitFor`
 - `hitSlop` (**accepts only negative values on iOS**)
 - `onGestureEvent`
 - `onHandlerStateChange`
 - `onBegan`
 - `onFailed`
 - `onCancelled`
 - `onActivated`
 - `onEnded`

#### `TapGestureHandler` extra properties

 - `maxDurationMs`
 - `maxDelayMs`
 - `numberOfTaps`

#### `NativeViewGestureHandler` extra properties

 - `shouldActivateOnStart`
 - `disallowInterruption`

#### `LongPressGestureHandler` extra properties

 - `minDurationMs`
 - `maxDist`

#### `PanGestureHandler` extra properties

 - `minDeltaX`
 - `minDeltaY`
 - `maxDeltaX`
 - `maxDeltaY`
 - `minOffsetX`
 - `minOffsetY`
 - `minDist`
 - `minVelocity`
 - `minVelocityX`
 - `minVelocityY`
 - `minPointers`
 - `maxPointers`
 - `avgTouches` (**Android only**)

#### `PinchGestureHandler`

#### `RotationGestureHandler`

## Buttons

Gesture handler library provides native components that can act as buttons. These can be treated as a replacement to `TouchableHighlight` or `TouchableOpacity` from RN core. Gesture handler's buttons recognize touches in native which makes the recognition process deterministic, allows for rendering ripples on Android in highly performant way (`TouchableNativeFeedback` requires that touch event does a roundtrip to JS before we can update ripple effect, which makes ripples lag a bit on older phones), and provides native and platform default interaction for buttons that are placed in a scrollable container (in which case the interaction is slightly delayed to prevent button from highlighting when you fling).

Currently Gesture handler library exposes three components that render native touchable elements under the hood:
 - `BaseButton`
 - `RectButton`
 - `BorderlessButton`

On top of that all the buttons are wrapped with `NativeViewGestureHandler` and therefore allow for all the [common gesture handler properties](#common-gesturehandler-properties) and `NativeViewGestureHandler`'s [extra properties](#nativeviewgesturehandler-extra-properties) to be applied to them.

#### `<BaseButton />` component

Can be used as a base class if you'd like to implement some custom interaction for when the button is pressed. The following props can be used:
 - `onActiveStateChange` - function that gets triggered when button changes from inactive to active and vice versa. It passes active state as a boolean variable as a first parameter for that method.
 - `onPress` - function that gets triggered when the button gets pressed (analogous to `onPress` in `TouchableHighlight` from RN core).

#### `<RectButton />` component

This type of button component should be used when you deal with a rectangular elements or blocks of content that can be pressed, for example table rows or buttons with text and icons. This component provides a platform specific interaction, rendering a rectangular ripple on Android or highlighting the background on iOS and on older versions of Android. In addition to the props of [`BaseButton`](#basebutton-component), it accepts the following:
 - `underlayColor` - this is the background color that will be dimmed when button is in active state.
 - `activeOpacity` (**iOS only**) - opacity applied to the underlay when button is in active state.

#### `<BorderlessButton />` component

This type of button component should be used with simple icon-only or text-only buttons. The interaction will be different depending on platform: on Android a borderless ripple will be rendered (it means that the ripple will animate into a circle that can span outside of the view bounds), whereas on iOS the button will be dimmed (similar to how `TouchableOpacity` works). In addition to the props of [`BaseButton`](#basebutton-component), it accepts the following:
 - `borderless` (**Android only**) - set this to `false` if you want the ripple animation to render only within view bounds.
 - `activeOpacity` (**iOS only**) - opacity applied to the button when it is in an active state.

## Controlling gesture handlers interactions

Gesture handler library API allows for defining some basic interaction between handler components. Interactions can be defined by first setting a string identifer for a handler component with the `id` property and then referencing it with `waitFor` or `simultaneousHandlers` props in other handler component.

#### `waitFor` property

This property accepts one or more gesture handler IDs (either as a single string or an array of strings). If this property is set, the gesture handler will wait for the provided handlers to fail before it can activate.

#### `simultaneousHandlers` property

This property accepts one or more gesture handler IDs (either as a single string or an array of strings). Setting this property will make the gesture handler recognize a gesture simultaneously with handlers with provided IDs. Typical use case would be a map component, for which we want both pinch and rotate gestures to be recognized simultaneously.

## Custom components

The `react-native-gesture-handler` library makes it possible to build some components with much better performance than PanResponder would allow for. To illustrate this, we've build a couple of components that are already available for React Native apps but often are build using PanResponder API which results in poor performance.

### `<DrawerLayout />`

This is a cross-platform replacement for React Native's [DrawerLayoutAndroid](http://facebook.github.io/react-native/docs/drawerlayoutandroid.html) component. It provides a compatible API but allows for the component to be used on both Android and iOS. Please refer to [React Native docs](http://facebook.github.io/react-native/docs/drawerlayoutandroid.html) for the detailed usage for standard parameters.

#### Usage:

`DrawerLayout` component isn't exported by default from the `react-native-gesture-handler` package. To use it, import it in the following way:
```js
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';
```

#### Props:

On top of the standard list of parameters DrawerLayout has an additional set of attributes to customize its behavior. Please refer to the list below:

 - `drawerType` – possible values are: `front`, `back` or `slide` (default is `front`). It specifies the way the drawer will be displayed. When set to `front` the drawer will slide in and out along with the gesture and will display on top of the content view. When `back` is used the drawer displays behind the content view and can be revealed with gesture of pulling the content view to the side. Finally `slide` option makes the drawer appear like it is attached to the side of the content view; when you pull both content view and drawer will follow the gesture.
 - `edgeWidth` – number, allows for defining how far from the edge of the content view the gesture should activate.
 - `hideStatusBar` – boolean, when set to `true` Drawer component will use [StatusBar](http://facebook.github.io/react-native/docs/statusbar.html) API to hide the OS status bar whenever the drawer is pulled or when its in an "open" state.
 - `statusBarAnimation` – possible values are: `slide`, `none` or `fade` (defaults to `slide`). Can be used when `hideStatusBar` is set to `true` and will select the animation used for hiding/showing the status bar. See [StatusBar](http://facebook.github.io/react-native/docs/statusbar.html#statusbaranimation) documentation for more details.
 - `overlayColor` – color (default to `"black"`) of a semi-transparent overlay to be displayed on top of the content view when drawer gets open. A solid color should be used as the opacity is added by the Drawer itself and the opacity of the overlay is animated (from 0% to 70%).
 - `renderNavigationView` - function. This attibute is present in the standard implementation already and is one of the required params. Gesture handler version of DrawerLayout make it possible for the function passed as `renderNavigationView` to take an Animated value as a parameter that indicates the progress of drawer opening/closing animation (progress value is 0 when closed and 1 when opened). This can be used by the drawer component to animated its children while the drawer is opening or closing.

#### Example:

An example code that that uses `DrawerLayout` component can be found here: [`horizontalDrawer/index.js`](https://github.com/kmagiera/react-native-gesture-handler/blob/master/Example/horizontalDrawer/index.js)

### `<Swipeable />`

This component allows for implementing swipeable rows or similar interaction. It renders its children within a panable container allows for horizontal swiping left and right. While swiping one of two "action" containers can be shown depends on whether user swipes left or right (containers can be rendered by `renderLeftActions` or `renderRightActions` props).

#### Usage:

Similarly to the `DrawerLayout`, `Swipeable` component isn't exported by default from the `react-native-gesture-handler` package. To use it, import it in the following way:
```js
import Swipeable from 'react-native-gesture-handler/Swipeable';
```

#### Props:
 - `friction` – a number that specifies how much the visual interation will be delayed compared to the gesture distance. e.g. value of 1 will indicate that the swipeable panel should exactly follow the gesture, 2 means it is going to be two times "slower".
 - `leftThreshold` – distance from the left edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.
 - `rightThreshold` – distance from the right edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.
 - `overshootLeft` – a boolean value indicating if the swipeable panel can be pulled further than the left actions panel's width. It is set to `true` by default as long as the left panel render method is present.
 - `overshootRight` – a boolean value indicating if the swipeable panel can be pulled further than the right actions panel's width. It is set to `true` by default as long as the right panel render method is present.
 - `onSwipeableLeftOpen` – method that is called when left action panel gets open.
 - `onSwipeableRightOpen` – method that is called when right action panel gets open.
 - `onSwipeableOpen` – method that is called when action panel gets open (either right or left).
 - `onSwipeableClose` – method that is called when action panel is closed.
 - `renderLeftActions` – method that is expected to return an action panel that is going to be revealed from the left side when user swipes right.
 - `renderRightActions` – method that is expected to return an action panel that is going to be revealed from the right side when user swipes left.

#### Example:

An example code that that uses `Swipeable` component can be found here: [`swipeable/index.js`](https://github.com/kmagiera/react-native-gesture-handler/blob/master/Example/swipeable/index.js)

## Troubleshooting

This project is still in alpha so it is not suprising you're seeking help. Try searching over the issues on GitHub [here](https://github.com/kmagiera/react-native-gesture-handler/issues). If you don't find anything that would help feel free to open a new issue!

## Contributing

If you are interested in the project and want to contribute or support it in other ways don't hesitate to contact me! Also all PRs are always welcome!

## Credits

This project is supported by amazing people from [Expo.io](https://expo.io) and [Software Mansion](https://swmansion.com)

[![expo](https://avatars2.githubusercontent.com/u/12504344?v=3&s=100 "Expo.io")](https://expo.io)
[![swm](https://avatars1.githubusercontent.com/u/6952717?v=3&s=100 "Software Mansion")](https://swmansion.com)
