---
id: gesture-composition
title: Gesture composition & interactions
sidebar_label: Gesture composition & interactions
sidebar_position: 3
---

Composing gestures is much simpler in RNGH2, you don't need to create a ref for every gesture that depends on another one. Instead you can use `Race`, `Simultaneous` and `Exclusive` methods provided by the `Gesture` object.

## Race

Only one of the provided gestures can become active at the same time. The first gesture to become active will cancel the rest of the gestures. It accepts variable number of arguments.
It is the equivalent to having more than one gesture handler without defining `simultaneousHandlers` and `waitFor` props.

For example, lets say that you have a component that you want to make draggable but you also want to show additional options on long press. Presumably you would not want the component to move after the long press activates. You can accomplish this using `Race`:

> Note: the `useSharedValue` and `useAnimatedStyle` are part of [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/).

```js
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

function App() {
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const popupPosition = useSharedValue({ x: 0, y: 0 });
  const popupAlpha = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
      ],
    };
  });

  const animatedPopupStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: popupPosition.value.x },
        { translateY: popupPosition.value.y },
      ],
      opacity: popupAlpha.value,
    };
  });

  const dragGesture = Gesture.Pan()
    .onStart((_e) => {
      popupAlpha.value = withTiming(0);
    })
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    });

  const longPressGesture = Gesture.LongPress().onStart((_event) => {
    popupPosition.value = { x: offset.value.x, y: offset.value.y };
    popupAlpha.value = withTiming(1);
  });

  const composed = Gesture.Race(dragGesture, longPressGesture);

  return (
    <Animated.View>
      <Popup style={animatedPopupStyles} />
      <GestureDetector gesture={composed}>
        <Component style={animatedStyles} />
      </GestureDetector>
    </Animated.View>
  );
}
```

## Simultaneous

All of the provided gestures can activate at the same time. Activation of one will not cancel the other.
It is the equivalent to having some gesture handlers, each with `simultaneousHandlers` prop set to the other handlers.

For example, if you want to make a gallery app, you might want user to be able to zoom, rotate and pan around photos. You can do it with `Simultaneous`:

> Note: the `useSharedValue` and `useAnimatedStyle` are part of [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/).

```js
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

function App() {
  const offset = useSharedValue({ x: 0, y: 0 });
  const start = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value.x },
        { translateY: offset.value.y },
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
    };
  });

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    });

  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotateGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const composed = Gesture.Simultaneous(
    dragGesture,
    Gesture.Simultaneous(zoomGesture, rotateGesture)
  );

  return (
    <Animated.View>
      <GestureDetector gesture={composed}>
        <Photo style={animatedStyles} />
      </GestureDetector>
    </Animated.View>
  );
}
```

## Exclusive

Only one of the provided gestures can become active, with the first one having a higher priority than the second one (if both gestures are still possible, the second one will wait for the first one to fail before it activates), second one having a higher priority than the third one, and so on.
It is equivalent to having some gesture handlers where the second one has the `waitFor` prop set to the first handler, third one has the `waitFor` prop set to the first and the second one, and so on.

For example, if you want to make a component that responds to single tap as well as to a double tap, you can accomplish that using `Exclusive`:

> Note: the `useSharedValue` and `useAnimatedStyle` are part of [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/).

```js
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  const singleTap = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      console.log('single tap!');
    }
  });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (success) {
        console.log('double tap!');
      }
    });

  const taps = Gesture.Exclusive(doubleTap, singleTap);

  return (
    <GestureDetector gesture={taps}>
      <Component />
    </GestureDetector>
  );
}
```

# Cross-component interactions

You may have noticed that gesture composition described above requires you to mount all of the composed gestures under a single `GestureDetector`, effectively attaching them to the same underlying component. You can customize how gestures interact with each other across multiple components in a couple of ways:

## requireExternalGestureToFail

`requireExternalGestureToFail` allows to delay activation of the handler until all handlers passed as arguments to this method fail (or don't begin at all).

For example, you may want to have two nested components, both of them can be tapped by the user to trigger different actions: outer view requires one tap, but the inner one requires 2 taps. If you don't want the first tap on the inner view to activate the outer handler, you must make the outer gesture wait until the inner one fails:

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

export default function Example() {
  const innerTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      console.log('inner tap');
    });

  const outerTap = Gesture.Tap()
    .onStart(() => {
      console.log('outer tap');
    })
    .requireExternalGestureToFail(innerTap);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={outerTap}>
        <View style={styles.outer}>
          <GestureDetector gesture={innerTap}>
            <View style={styles.inner} />
          </GestureDetector>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    width: 250,
    height: 250,
    backgroundColor: 'lightblue',
  },
  inner: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
});
```

## blocksExternalGesture

`blocksExternalGesture` works similarly to `requireExternalGestureToFail` but the direction of the relation is reversed - instead of being one-to-many relation, it's many-to-one. It's especially useful for making lists where the `ScrollView` component needs to wait for every gesture underneath it. All that's required to do is to pass a ref, for example:

```jsx
import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const ITEMS = ['red', 'green', 'blue', 'yellow'];

function Item({ backgroundColor, scrollRef }) {
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .blocksExternalGesture(scrollRef)
    .onBegin(() => {
      zIndex.value = 100;
    })
    .onChange((e) => {
      scale.value *= e.scaleChange;
    })
    .onFinalize(() => {
      scale.value = withTiming(1, undefined, (finished) => {
        if (finished) {
          zIndex.value = 1;
        }
      });
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    zIndex: zIndex.value,
  }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.View
        style={[
          { backgroundColor: backgroundColor },
          styles.item,
          animatedStyles,
        ]}
      />
    </GestureDetector>
  );
}

export default function Example() {
  const scrollRef = useRef();

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView style={styles.container} ref={scrollRef}>
        {ITEMS.map((item) => (
          <Item backgroundColor={item} key={item} scrollRef={scrollRef} />
        ))}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flex: 1,
    aspectRatio: 1,
  },
});
```

## simultaneousWithExternalGesture

`simultaneousWithExternalGesture` allows gestures across different components to be recognized simultaneously. For example, you may want to have two nested views, both with tap gesture attached. Both of them require one tap, but tapping the inner one should also activate the gesture attached to the outer view:

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

export default function Example() {
  const innerTap = Gesture.Tap()
    .onStart(() => {
      console.log('inner tap');
    });

  const outerTap = Gesture.Tap()
    .onStart(() => {
      console.log('outer tap');
    })
    .simultaneousWithExternalGesture(innerTap);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={outerTap}>
        <View style={styles.outer}>
          <GestureDetector gesture={innerTap}>
            <View style={styles.inner} />
          </GestureDetector>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    width: 250,
    height: 250,
    backgroundColor: 'lightblue',
  },
  inner: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
});
```