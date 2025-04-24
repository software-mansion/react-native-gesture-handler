import React, { useRef } from 'react';

import { StyleSheet, Animated, View, Text } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { USE_NATIVE_DRIVER } from '../../config';

export default function Example() {
  const translationX = useRef(new Animated.Value(0)).current;
  const translationY = useRef(new Animated.Value(0)).current;
  const lastTranslation = useRef({ x: 0, y: 0 }).current;

  const smallTranslationX = useRef(new Animated.Value(0)).current;
  const smallTranslationY = useRef(new Animated.Value(0)).current;
  const lastSmallTranslation = useRef({ x: 0, y: 0 }).current;

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translationX,
          translationY: translationY,
        },
      },
    ],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastTranslation.x += event.nativeEvent.translationX;
      lastTranslation.y += event.nativeEvent.translationY;
      translationX.setOffset(lastTranslation.x);
      translationX.setValue(0);
      translationY.setOffset(lastTranslation.y);
      translationY.setValue(0);
    }
  };

  const onGestureEventSmall = Animated.event(
    [
      {
        nativeEvent: {
          translationX: smallTranslationX,
          translationY: smallTranslationY,
        },
      },
    ],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );

  const onHandlerStateChangeSmall = (
    event: PanGestureHandlerStateChangeEvent
  ) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastSmallTranslation.x += event.nativeEvent.translationX;
      lastSmallTranslation.y += event.nativeEvent.translationY;
      smallTranslationX.setOffset(lastSmallTranslation.x);
      smallTranslationX.setValue(0);
      smallTranslationY.setOffset(lastSmallTranslation.y);
      smallTranslationY.setValue(0);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ padding: 10 }}>
        Both balls should be draggable and while draggind smaller ball, the
        bigger one shold be stationary. Clicking on any of the components should
        activate the tap handler that is logs a message to the console.
      </Text>
      <TapGestureHandler
        onActivated={() => console.log('tap')}
        shouldCancelWhenOutside={false}>
        <Animated.View>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}>
            <Animated.View style={[styles.outerRect]}>
              <Animated.View style={[styles.rect]}>
                <Animated.View
                  style={[
                    styles.circle,
                    {
                      transform: [
                        { translateX: translationX },
                        { translateY: translationY },
                      ],
                    },
                  ]}>
                  <PanGestureHandler
                    onGestureEvent={onGestureEventSmall}
                    onHandlerStateChange={onHandlerStateChangeSmall}>
                    <Animated.View
                      style={[
                        styles.smallCircle,
                        {
                          transform: [
                            { translateX: smallTranslationX },
                            { translateY: smallTranslationY },
                          ],
                        },
                      ]}
                    />
                  </PanGestureHandler>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 75,
    height: 75,
    borderRadius: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
  smallCircle: {
    width: 45,
    height: 45,
    borderRadius: 45,
    backgroundColor: 'cyan',
    alignSelf: 'center',
  },
  rect: {
    backgroundColor: 'green',
    height: 100,
  },
  outerRect: {
    padding: 25,
    backgroundColor: 'yellow',
  },
});
