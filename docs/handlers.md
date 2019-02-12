---
id: handlers
title: Gesture Handlers
---

## API

Here are a gesture recognizers currently available in the package:
 - `TapGestureHandler`
 - `LongPressGestureHandler`
 - `PanGestureHandler`
 - `PinchGestureHandler`
 - `RotationGestureHandler`
 - `FlingGestureHandler`
 - `ForceTouchGestureHandler`

Whenever you use a native component that should handle touch events you can either wrap it with `NativeViewGestureHandler` or import wrapper component exported by the library instead of importing it from `react-native` package. Here is the list of available components:
 - `ScrollView`
 - `Slider`
 - `Switch`
 - `TextInput`
 - `ToolbarAndroid` (**Android only**)
 - `ViewPagerAndroid` (**Android only**)
 - `DrawerLayoutAndroid` (**Android only**)


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

#### `FlingGestureHandler` extra properties

 - `direction`
 - `numberOfPointers`
