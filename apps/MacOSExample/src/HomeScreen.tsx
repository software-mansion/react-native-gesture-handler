import * as React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

import { isFabric, isHermes } from './utils';
import { COLORS } from './colors';

declare const performance: {
  now: () => number;
};

interface GestureDetectorDemoProps {
  color: string;
}

export function GestureDetectorDemo({ color }: GestureDetectorDemoProps) {
  const gesture = Gesture.Pan()
    .onBegin(() => {
      console.log(performance.now(), 'onBegin');
    })
    .onStart(() => {
      console.log(performance.now(), 'onStart');
    })
    .onUpdate(() => {
      console.log(performance.now(), 'onUpdate');
    })
    .onEnd(() => {
      console.log(performance.now(), 'onEnd');
    })
    .onFinalize(() => {
      console.log(performance.now(), 'onFinalize');
    });

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>Gesture.Pan</Text>
      <GestureDetector gesture={gesture}>
        <View style={[styles.box, { backgroundColor: color }]} />
      </GestureDetector>
    </View>
  );
}

interface ManualGestureDemoProps {
  color: string;
}

export function ManualGestureDemo({ color }: ManualGestureDemoProps) {
  const gesture = Gesture.Manual()
    .onTouchesDown(() => {
      console.log(performance.now(), 'onTouchesDown');
    })
    .onTouchesMove(() => {
      console.log(performance.now(), 'onTouchesMove');
    })
    .onTouchesUp(() => {
      console.log(performance.now(), 'onTouchesUp');
    });

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>Gesture.Manual</Text>
      <GestureDetector gesture={gesture}>
        <View style={[styles.box, { backgroundColor: color }]} />
      </GestureDetector>
    </View>
  );
}

interface PanGestureHandlerDemoProps {
  color: string;
}

export function PanGestureHandlerDemo({ color }: PanGestureHandlerDemoProps) {
  const onGestureEvent = () => {
    console.log(performance.now(), 'onGestureEvent');
  };

  const onHandlerStateChange = () => {
    console.log(performance.now(), 'onHandlerStateChange');
  };

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>PanGestureHandler</Text>
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <View style={[styles.box, { backgroundColor: color }]} />
      </PanGestureHandler>
    </View>
  );
}

type AnimatedEventDemoProps = {
  useNativeDriver: boolean;
  color: string;
};

export function AnimatedEventDemo({
  useNativeDriver,
  color,
}: AnimatedEventDemoProps) {
  const drag = React.useRef(new Animated.Value(0));

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: drag.current } }],
    { useNativeDriver }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (
      event.nativeEvent.state === State.FAILED ||
      event.nativeEvent.state === State.CANCELLED ||
      event.nativeEvent.state === State.END
    ) {
      Animated.spring(drag.current, {
        velocity: event.nativeEvent.velocityX,
        tension: 10,
        friction: 2,
        toValue: 0,
        useNativeDriver,
      }).start();
    }
  };

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>
        Animated.event useNativeDriver: {useNativeDriver.toString()}
      </Text>
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View
          style={[
            styles.box,
            {
              transform: [{ translateX: drag.current }],
              backgroundColor: color,
            },
          ]}
        />
      </PanGestureHandler>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.bold}>Hello from React Native Gesture Handler!</Text>
      <Text style={styles.bold}>
        This example app runs on {isHermes() ? 'Hermes' : 'JSC'} with Fabric{' '}
        {isFabric() ? 'enabled' : 'disabled'}.
      </Text>
      <GestureDetectorDemo color={COLORS.NAVY} />
      <ManualGestureDemo color={COLORS.KINDA_RED} />
      <PanGestureHandlerDemo color={COLORS.YELLOW} />
      <AnimatedEventDemo color={COLORS.KINDA_GREEN} useNativeDriver />
      <AnimatedEventDemo color={COLORS.KINDA_BLUE} useNativeDriver={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  text: {
    marginVertical: 3,
  },
  demo: {
    marginVertical: 3,
    alignItems: 'center',
  },
  box: {
    width: 50,
    height: 50,
  },
});
