# react-native-gesture-handler

Native way of handling touch & gestures for React Native apps!

This library provides an API that exposes mobile platform specific native capabilities of touch & gesture handling and recognition. It allows for defining complex gesture handling and recognition logic that runs 100% in native thread and is therefore deterministic.

### What does it give me:
 - It provides a way to access native touch handling logic for recognizing pinch, rotation, pan and other
 - You can define relations between gesture handlers, e.g. when you have pan handler in scrollview you can make scrollview to wait until it knows pan won't recognize
 - You can use touchables that run in native and follow platform default behaviour in case when they are embbede in scrollable component (the interaction is slightly delayed to prevent button from highlighting when you fling)
 - You can implement smooth gesture interactions that thanks to "Animated Native Driver" can run even when JS thread is overloaded

## Installation

I. First install the library from npm repository using `yarn`:
```bash
  yarn add react-native-gesture-handler
```

or using `npm` if you prefer:
```bash
  npm install --save react-native-gesture-handler
```

II (**Android**). Update your main activity (or wherever you create an instance of `ReactActivityDelegate`), so that it overrides the method responsible for creating a `ReactRootView` instance. Then use a root view wrapper provided by this library:
```java
// Don't forget imports
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

class MainActivity extends ReactActivity {

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

II (**iOS**). There is no additional config required to be done on iOS except from what follows in the next steps.

III. Run:
```bash
  react-native link react-native-gesture-handler
```

IV. You're all set, just run your app with `react-native run-android` or `react-native run-ios`

## Examples

If you don't feel like trying it on a real app, but just want to play with the API you can run the example project. Clone the repo, go to the `Example/` folder and run:
```bash
  yarn install
```

Then run `react-native run-android` or `react-native run-ios` depending on which platform you want to run the example app on.

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
 - `shouldCancelWhenOutside`
 - `simultaneousHandlers`
 - `waitFor`
 - `hitSlop` (**Android only**)
 - `onGestureEvent`
 - `onHandlerStateChange`

#### `TapGestureHandler` extra properties

 - `maxDurationMs`
 - `maxDelayMs`
 - `numberOfTaps`

#### `NativeViewGestureHandler` extra properties

 - `shouldActivateOnStart`
 - `disallowInterruption`

#### `LongPressGestureHandler` extra properties

 - `minDurationMs`

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

Gesture handler library provides native components that can act as buttons. These can be treated as a replacement to `TouchableHighlight` or `TouchableOpacity` from RN core. Gesture handler's buttons recognize touches in native which makes the recognition process deterministic, allows for rendering ripples on android in performant way (with `TouchableNativeFeedback` it is required that touch event to a roundtrip to JS before we can update ripple which makes ripples lag a bit on older phones), and provides native and platform default interaction for buttons that are placed in a scrollable container (in which case the interaction is slightly delay to prevent button from highlighting when you fling).

Currently Gesture handler library exposes three components that renders native touchable elements under the hood:
 - `BaseButton`
 - `RectButton`
 - `BorderlessButton`

On top of that all the buttons are wrapped with `NativeViewGestureHandler` and therefore allow for all the [common gesture handler properties](#common-gesturehandler-properties) and `NativeViewGestureHandler`'s [extra properties](#nativeviewgesturehandler-extra-properties) to be applied to them.

#### `BaseButton` component

Can be used as a base class if you'd like to implement some custom interaction for when the button is pressed. The following props can be used:
 - `onActiveStateChange` - function that gets triggered when button changes from inactive to active and vice versa. It passes active state as a boolean variable as a first parameter for that method.
 - `onPress` - function that gets triggered when the button gets pressed (similar to how it works with `TouchableHighlight` from RN core).

#### `RectButton` component

This type of a button component should be used when you deal with a rectangular elements or blocks of content that can be pressed, like table rows or buttons with text and icons. This component provides a platform specific interaction rendering a rectangular ripple on android or highlighting the background on iOS and on older versions of android. Along with all the properties of [`BaseButton`](#basebutton-component) it allows for specifying the following props:
 - `underlayColor` - this is the background color that will be dimmed when button is in active state.
 - `activeOpacity` (**iOS only**) - opacity applied to the underlay when button is in active state.

#### `BorderlessButton` component

This type of a button component should be used with simple icon-only or text-only buttons. The interaction will be different depending on platform: on android a borderless ripple will be rendered (it means that the ripple will animate into a circle that can span outside of the view bounds) whereas on iOS the button will be dimmed (similar to how `TouchableOpacity` works). Along with all the properties of [`BaseButton`](#basebutton-component) it allows for specifying the following props:
 - `borderless` (**Android only**) - set this to `false` if you want the ripple animation to render only within view bounds.
 - `activeOpacity` (**iOS only**) - opacity applied to the button when it is in an active state.

## Controlling gesture handlers interactions

Gesture handler library API allows for defining some basic interaction between handler components. Interactions can be defined by first setting a string identifer for a handler component with `id` property and then referencing it with `waitFor` or `simultaneousHandlers` props in other handler component.

#### `waitFor` property

This property accepts a single string ID of a gesture handler or an array of string IDs. When set for a given gesture handler it will make it wait for the handler(s) with the given ID(s) to fail before it can activate.

#### `simultaneousHandlers` property

This property accepts a single string ID of a gesture handler or an array of string IDs. When set for a given gesture handler it allow for this gesture handler to recognize simultaneousy with handler(s) with the given ID(s). One popular usecase is with a photo that can be pinched and rotated, in which case we want both pinch and rotate gesture handlers to recognize simultaneously.

## Troubleshooting

This project is still in alpha so it is not suprising you're seeking help. Try searching over the issues on GitHub [here](https://github.com/kmagiera/react-native-gesture-handler/issues). If you don't find anything that would help feel free to open a new issue!

## Contributing

If you are interested in the project and want to contribute or support it in other ways don't hesitate to contact me! Also all PRs are always welcome!

## Credits

This project is supported by amazing people from [Expo.io](https://expo.io) and [Software Mansion](https://swmansion.com)

[![expo](https://avatars2.githubusercontent.com/u/12504344?v=3&s=100 "Expo.io")](https://expo.io)
[![swm](https://avatars1.githubusercontent.com/u/6952717?v=3&s=100 "Software Mansion")](https://swmansion.com)
