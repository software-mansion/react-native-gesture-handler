---
id: component-swipeable
title: Swipeable
sidebar_label: Swipeable
---

<img src="assets/sampleswipeable.gif" height="120" />

This component allows implementing swipeable row and similar behavior as seen in many email and other list based apps. The component does this by enabling the animation of left and right child view containers in response to (usually horizonal) row dragging events. When combined, a typical animation effect is to have action menus reveal themselves from the side of the screen and perform default actions according to swipe direction.    


### Usage:

Similarly to the `DrawerLayout`, `Swipeable` component isn't exported by default from the `react-native-gesture-handler` package. To use it, import it in the following way:
```js
import Swipeable from 'react-native-gesture-handler/Swipeable';
```

## Properties

---
### `childrenContainerStyle`
style object for the children 'action' menu container (Animated.View), for example to apply `flex: 1`.

---
### `close`
method that closes component.

---
### `containerStyle`
style object for the original content container (Animated.View), for example to override `overflow: 'hidden'`.

---
### `friction`
 a number that specifies how much the visual interaction will be delayed compared to the gesture distance. e.g. value of 1 will indicate that the swipeable panel should exactly follow the gesture, 2 means it is going to be two times "slower".

---
### `leftDefaultActionConfig`
optional, allows specification of left default action behaviour, i.e. what should be triggered on release if the user continues dragging past the point where the menu is fully open. 

Takes an object with with following keys.

- `onTrigger` - callback function to trigger if the threshold is exceeded on release. NB it is the responsibility of the callback to shut the menu if that is required.
- `threshold` - the on release threshold beyond which the action will be triggered. Typically this should be at least 1/2 a button width larger than the maximum width of the revealed action menu width.
- `menuWidth` - number, width of fully revealed action menu. 
 
---
### `leftThreshold`
distance from the left edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.

---
### `onSwipeableClose`
method that is called when action panel is closed.

---
### `onSwipeableLeftOpen`
method that is called when left action panel gets open.

---
### `onSwipeableLeftWillOpen`
method that is called when left action panel starts animating on open.

---
### `onSwipeableOpen`
method that is called when action panel gets open (either right or left).

---
### `onSwipeableRightOpen`
method that is called when right action panel gets open.

---
### `onSwipeableRightWillOpen`
method that is called when right action panel starts animating on open.

---
### `onSwipeableWillClose`
method that is called when action panel starts animating on close.

---
### `onSwipeableWillOpen`
method that is called when action panel starts animating on open (either right or left).


---
### `openLeft`
method that opens component on left side.

---
### `openRight`
method that opens component on right side.

---
### `overshootFriction`
a number that specifies how much the visual interaction will be delayed compared to the gesture distance at overshoot. Default value is 1, it mean no friction, for a native feel, try 8 or above.

---
### `overshootLeft`
a boolean value indicating if the swipeable panel can be pulled further than the left actions panel's width. It is set to `true` by default as long as the left panel render method is present.

---
### `overshootRight`
a boolean value indicating if the swipeable panel can be pulled further than the right actions panel's width. It is set to `true` by default as long as the right panel render method is present.

---
### `renderLeftActions`
method that is expected to return an action panel that is going to be revealed from the left side when user swipes right.

---
### `renderRightActions`
method that is expected to return an action panel that is going to be revealed from the right side when user swipes left.

### `rightDefaultActionConfig`
optional, allows specification of right default action behaviour, i.e. what should be triggered on release if the user continues dragging past the point where the menu is fully open. 

Takes an object with with following keys.

- `onTrigger` - callback function to trigger if the threshold is exceeded on release. NB it is the responsibility of the callback to shut the menu if that is required.
- `threshold` - positive number, from right hand side the on release threshold beyond which the action will be triggered. Typically this should be at least 1/2 a button width larger than the maximum width of the revealed action menu width.
- `menuWidth` - number, width of fully revealed action menu. 

---
### `rightThreshold`
distance from the right edge at which released panel will animate to the open state (or the open panel will animate into the closed state). By default it's a half of the panel's width.



## Methods
Using reference to `Swipeable` it's possible to trigger some actions on it




### Example:

See the [swipeable example](https://github.com/kmagiera/react-native-gesture-handler/blob/master/Example/swipeable/index.js) from [GestureHandler Example App](example.md) or view it directly on your phone by visiting [our expo demo](https://exp.host/@osdnk/gesturehandlerexample).
```js
class AppleStyleSwipeableRow extends Component {
  renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <RectButton style={styles.leftAction} onPress={this.close}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          Archive
        </Animated.Text>
      </RectButton>
    );
  };
  render() {
    return (
      <Swipeable
        renderLeftActions={this.renderLeftActions}>
        <Text>
           "hello"
         </Text>
      </Swipeable>
    );
  }
}
```
