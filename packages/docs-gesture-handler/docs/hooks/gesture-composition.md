---
id: gesture-composition
title: Gesture composition & interactions
sidebar_label: Gesture composition & interactions
sidebar_position: 10
---

RNGH3 provides simple way to set up interactions between gestures by using dedicated hooks and config properties.

## Composition hooks

### useCompetingGestures

Only one of the provided gestures can become active at the same time. The first gesture to become active will cancel the rest of the gestures. It accepts variable number of arguments.
It is the equivalent to having more than one gesture handler without defining `simultaneousWith`, `requireTofail` and `block` props.

For example, lets say that you have a component that you want to make draggable but you also want to show additional options on long press. Presumably you would not want the component to move after the long press activates. You can accomplish this using `useCompetingGestures`:

> Note: the `useSharedValue` and `useAnimatedStyle` are part of [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/).

```js
import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  useLongPressGesture,
  GestureHandlerRootView,
  useCompetingGestures,
} from 'react-native-gesture-handler';

export default function App() {
  const panGesture = usePanGesture({
    onUpdate: () => {
      console.log('Pan');
    },
  });
  const longPressGesture = useLongPressGesture({
    onDeactivate: (_, success) => {
      if (success) {
        console.log('Long Press');
      }
    },
  });

  const gesture = useCompetingGestures(panGesture, longPressGesture);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.box} />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  box: {
    height: 120,
    width: 120,
    backgroundColor: '#b58df1',
    borderRadius: 20,
    marginBottom: 30,
  },
});
```

### useSimultaneousGestures

All of the provided gestures can activate at the same time. Activation of one will not cancel the other.
It is the equivalent to having some gesture handlers, each with `simultaneousWith` prop set to the other handlers.

For example, if you want to make a gallery app, you might want user to be able to zoom, rotate and pan around photos. You can do it with `useSimultaneousGestures`:

> Note: the `useSharedValue` and `useAnimatedStyle` are part of [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/).

```js
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export default function App() {
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

  const dragGesture = usePanGesture({
    averageTouches: true,
    onUpdate: (e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    },
    onDeactivate: () => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    },
  });

  const zoomGesture = usePinchGesture({
    onUpdate: (e) => {
      scale.value = savedScale.value * e.scale;
    },
    onDeactivate: () => {
      savedScale.value = scale.value;
    },
  });

  const rotationGesture = useRotationGesture({
    onUpdate: (e) => {
      rotation.value = savedRotation.value + e.rotation;
    },
    onDeactivate: () => {
      savedRotation.value = rotation.value;
    },
  });

  const composedGesture = useSimultaneousGestures(
    dragGesture,
    zoomGesture,
    rotationGesture
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.box, animatedStyles]} />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
  },
});
```

### useExclusiveGestures

Only one of the provided gestures can become active, with the first one having a higher priority than the second one (if both gestures are still possible, the second one will wait for the first one to fail before it activates), second one having a higher priority than the third one, and so on.
It is equivalent to having some gesture handlers where the second one has the `requireToFail` prop set to the first handler, third one has the `requireToFail` prop set to the first and the second one, and so on.

For example, if you want to make a component that responds to single tap as well as to a double tap, you can accomplish that using `useExclusiveGestures`:

> Note: the `useSharedValue` and `useAnimatedStyle` are part of [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/).

```js
import { StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useTapGesture,
  useExclusiveGestures,
} from 'react-native-gesture-handler';

export default function App() {
  const singleTap = useTapGesture({
    onDeactivate: (_, success) => {
      if (success) {
        console.log('Single tap!');
      }
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: (_, success) => {
      if (success) {
        console.log('Double tap!');
      }
    },
  });

  const taps = useExclusiveGestures(doubleTap, singleTap);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={taps}>
        <View style={styles.box} />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'plum',
  },
});
```

## Cross-component interactions

You may have noticed that gesture composition described above requires you to mount all of the composed gestures under a single `GestureDetector`, effectively attaching them to the same underlying component. You can customize how gestures interact with each other across multiple components in a couple of ways:

### requireToFail

`requireToFail` allows to delay activation of the handler until all handlers passed as arguments to this method fail (or don't begin at all).

For example, you may want to have two nested components, both of them can be tapped by the user to trigger different actions: outer view requires one tap, but the inner one requires 2 taps. If you don't want the first tap on the inner view to activate the outer handler, you must make the outer gesture wait until the inner one fails:

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useTapGesture,
} from 'react-native-gesture-handler';

export default function Example() {
  const innerTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: (_, success) => {
      if (success) {
        console.log('inner tap');
      }
    },
  });

  const outerTap = useTapGesture({
    onDeactivate: (_, success) => {
      if (success) {
        console.log('outer tap');
      }
    },
    requireToFail: innerTap,
  });

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

### block

`block` works similarly to `requireToFail` but the direction of the relation is reversed - instead of being one-to-many relation, it's many-to-one. It's especially useful for making lists where the `ScrollView` component needs to wait for every gesture underneath it. All that's required to do is to pass a ref, for example:

```jsx
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  ScrollView,
  NativeGesture,
  usePinchGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const ITEMS = ['red', 'green', 'blue', 'yellow'];

export default function Example() {
  const [scrollGesture, setScrollGesture] = useState<NativeGesture | null>(
    null
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={styles.container}
        onGestureUpdate_CAN_CAUSE_INFINITE_RERENDER={(gesture) => {
          if (!scrollGesture || scrollGesture.tag !== gesture.tag) {
            setScrollGesture(gesture);
          }
        }}>
        {ITEMS.map((item) => (
          <Item
            backgroundColor={item}
            key={item}
            scrollGesture={scrollGesture}
          />
        ))}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

type ItemProps = {
  backgroundColor: string;
  scrollGesture: NativeGesture | null;
};

function Item({ backgroundColor, scrollGesture }: ItemProps) {
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);

  const pinch = usePinchGesture({
    onBegin: () => {
      zIndex.value = 100;
    },
    onUpdate: (e) => {
      scale.value *= e.scaleChange;
    },
    onFinalize: () => {
      scale.value = withTiming(1, undefined, (finished) => {
        if (finished) {
          zIndex.value = 1;
        }
      });
    },
    block: scrollGesture ?? undefined,
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

### simultaneousWith

`simultaneousWith` allows gestures across different components to be recognized simultaneously. For example, you may want to have two nested views, both with tap gesture attached. Both of them require one tap, but tapping the inner one should also activate the gesture attached to the outer view:

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useTapGesture,
} from 'react-native-gesture-handler';

export default function Example() {
  const innerTap = useTapGesture({
    onDeactivate: (_, success) => {
      if (success) {
        console.log('inner tap');
      }
    },
  });

  const outerTap = useTapGesture({
    onDeactivate: (_, success) => {
      if (success) {
        console.log('outer tap');
      }
    },
    simultaneousWith: innerTap,
  });

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
