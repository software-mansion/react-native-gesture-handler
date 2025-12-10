---
id: use-tap-gesture
title: Tap gesture
sidebar_label: Tap gesture
sidebar_position: 2
---

import { vanishOnMobile, appearOnMobile, webContainer } from '@site/src/utils/getGestureStyles';

import useBaseUrl from '@docusaurus/useBaseUrl';

import TapGestureBasic from '@site/static/examples/TapGestureBasic';
import TapGestureBasicSrc from '!!raw-loader!@site/static/examples/TapGestureBasic';

<div className={webContainer}>
  <div className={vanishOnMobile} style={{ display: 'flex', justifyContent: 'center', maxWidth: 360 }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/tap.mp4")} type="video/mp4"/>
    </video>
  </div>
  <InteractiveExample
    component={<TapGestureBasic/>}
    src={TapGestureBasicSrc}
    disableMarginBottom={true}
  />
</div>

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';

A discrete gesture that recognizes one or many taps.

Tap gestures detect one or more fingers briefly touching the screen.
The fingers involved in these gestures must not move significantly from their initial touch positions.
The required number of taps and allowed distance from initial position may be configured.
For example, you might configure tap gesture recognizers to detect single taps, double taps, or triple taps.

In order for a gesture to [activate](/docs/fundamentals/states-events#active), specified gesture requirements such as minPointers, numberOfTaps, maxDist, maxDuration, and maxDelayMs (explained below) must be met. Immediately after the gesture [activates](/docs/fundamentals/states-events#active), it will [end](/docs/fundamentals/states-events#end).

  <div className={appearOnMobile} style={{ display: 'flex', justifyContent: 'center' }}>
    <video playsInline autoPlay muted loop style={{maxWidth: 360}}>
      <source src={useBaseUrl("/video/tap.mp4")} type="video/mp4"/>
    </video>
  </div>

## Example

```jsx
import { View, StyleSheet } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useTapGesture,
} from 'react-native-gesture-handler';

export default function App() {
  const singleTap = useTapGesture({
    maxDuration: 250,
    onActivate: () => {
      console.log('Single tap!');
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={singleTap}>
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

## Config

### Properties specific to `TapGesture`:

### minPointers

```ts
minPointers: number | SharedValue<number>;
```

Minimum number of pointers (fingers) required to be placed before the gesture [activates](/docs/fundamentals/states-events#active). Should be a positive integer. The default value is 1.

### maxDuration

```ts
maxDuration: number | SharedValue<number>;
```

Maximum time, expressed in milliseconds, that defines how fast a finger must be released after a touch. The default value is 500.

### maxDelay

```ts
maxDelay: number | SharedValue<number>;
```

Maximum time, expressed in milliseconds, that can pass before the next tap — if many taps are required. The default value is 500.

### numberOfTaps

```ts
numberOfTaps: number | SharedValue<number>;
```

Number of tap gestures required to [activate](/docs/fundamentals/states-events#active) the gesture. The default value is 1.

### maxDeltaX

```ts
maxDeltaX: number | SharedValue<number>;
```

Maximum distance, expressed in points, that defines how far the finger is allowed to travel along the X axis during a tap gesture. If the finger travels further than the defined distance along the X axis and the gesture hasn't yet [activated](/docs/fundamentals/states-events#active), it will fail to recognize the gesture.

### maxDeltaY

```ts
maxDeltaY: number | SharedValue<number>;
```

Maximum distance, expressed in points, that defines how far the finger is allowed to travel along the Y axis during a tap gesture. If the finger travels further than the defined distance along the Y axis and the gesture hasn't yet [activated](/docs/fundamentals/states-events#active), it will fail to recognize the gesture.

### maxDistance

```ts
maxDistance: number | SharedValue<number>;
```

Maximum distance, expressed in points, that defines how far the finger is allowed to travel during a tap gesture. If the finger travels further than the defined distance and the gesture hasn't yet [activated](/docs/fundamentals/states-events#active), it will fail to recognize the gesture.

### mouseButton (Web & Android only)

```ts
mouseButton: MouseButton | SharedValue<MouseButton>;
```

```ts
enum MouseButton {
  LEFT,
  RIGHT,
  MIDDLE,
  BUTTON_4,
  BUTTON_5,
  ALL,
}
```

Allows users to choose which mouse button should handler respond to. Arguments can be combined using `|` operator, e.g. `mouseButton(MouseButton.LEFT | MouseButton.RIGHT)`. Default value is set to `MouseButton.LEFT`.

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />

## Event data

### Event attributes specific to `TapGesture`:

### x

```ts
x: number;
```

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](/docs/gestures/gesture-detector).

### y

```ts
y: number;
```

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the view attached to the [`GestureDetector`](/docs/gestures/gesture-detector).

### absoluteX

```ts
absoluteX: number;
```

X coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. It is recommended to use `absoluteX` instead of [`x`](#x) in cases when the view attached to the [`GestureDetector`](/docs/gestures/gesture-detector) can be transformed as an effect of the gesture.

### absoluteY

```ts
absoluteY: number;
```

Y coordinate, expressed in points, of the current position of the pointer (finger or a leading pointer when there are multiple fingers placed) relative to the window. It is recommended to use `absoluteY` instead of [`y`](#y) in cases when the view attached to the [`GestureDetector`](/docs/gestures/gesture-detector) can be transformed as an effect of the gesture.

<BaseEventData />
