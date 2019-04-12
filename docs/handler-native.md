---
id: handler-native
title: NativeViewGestureHandler
sidebar_label: NativeViewGestureHandler
---

A gesture handler that wraps a variety of native components:

 - `ScrollView`
 - `FlatList`
 - `Switch`
 - `TextInput`
 - `ToolbarAndroid` (**Android only**)
 - `DrawerLayoutAndroid` (**Android only**)

## Properties

See [set of properties inherited from base handler class](handler-common.md#properties). Below is a list of properties specific to `NativeViewGestureHandler` component:

---
### `shouldActivateOnStart` (**Android only**)

Determines whether the handler should check for an existing touch event on instantiation.

---
### `disallowInterruption`

When `true`, cancels all other gesture handlers when this `NativeViewGestureHandler` receives an `ACTIVE` state event.

## Example

```js

const WrappedScrollView = () => (
	<NativeViewGestureHandler>
	  <Animated.ScrollView
	    onScroll={({ nativeEvent }) => {
      	const { x, y } = nativeEvent.contentOffset;
        console.log(`Scroll offset changed (x: ${x}, y: ${y})`);
      }}
	    scrollEventThrottle={1}
	  />
	</NativeViewGestureHandler>
);
```
