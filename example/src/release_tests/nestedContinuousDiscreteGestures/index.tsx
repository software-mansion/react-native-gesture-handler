import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  RectButton,
} from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export default function EmptyExample() {
  const externalPosition = useSharedValue<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const nestedPosition = useSharedValue<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const setter = (
    position: SharedValue<{
      x: number;
      y: number;
    }>
  ) => {
    return (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      'worklet';
      position.value = {
        x: event.translationX,
        y: event.translationY,
      };
    };
  };

  const resetter = (
    position: SharedValue<{
      x: number;
      y: number;
    }>
  ) => {
    return () => {
      'worklet';
      position.value = {
        x: withSpring(0),
        y: withSpring(0),
      };
    };
  };

  const scrollGesture = Gesture.Native();

  const externalPan = Gesture.Pan()
    .onUpdate(setter(externalPosition))
    .onFinalize(resetter(externalPosition));

  const nestedPan = Gesture.Pan()
    // .simultaneousWithExternalGesture(scrollGesture)
    .onUpdate(setter(nestedPosition))
    .onFinalize(resetter(nestedPosition));

  const externalAnimation = useAnimatedStyle(() => {
    return {
      ...styles.box,
      transform: [
        { translateX: externalPosition.value.x },
        { translateY: externalPosition.value.y },
      ],
    };
  });

  const nestedAnimation = useAnimatedStyle(() => {
    return {
      ...styles.box,
      transform: [
        { translateX: nestedPosition.value.x },
        { translateY: nestedPosition.value.y },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.externalContainer}>
        {/* Continuous gesture inside discrete native button */}
        <RectButton
          onPress={() => console.log('left top outer native button')}
          style={[styles.box, { backgroundColor: 'pink', height: 150 }]}>
          <GestureDetector gesture={externalPan}>
            <Animated.View style={externalAnimation}>
              <Text>Continuous gesture inside discrete native button.</Text>
            </Animated.View>
          </GestureDetector>
        </RectButton>
      </View>

      {/* Continuous gesture inside continuous native list - horizontal */}
      <GestureDetector gesture={scrollGesture}>
        <ScrollView style={styles.horizontalList} horizontal>
          {new Array(20)
            .fill(1)
            .map((value, index) => value * index)
            .map((value) => (
              // Discrete gesture inside continuous native list
              <RectButton
                key={value}
                onPress={() =>
                  console.log('discrete gesture inside horizontal scroll view')
                }
                style={styles.horizontalElement}>
                <Text>
                  Discrete gesture inside continuous native list no. {value}
                </Text>
              </RectButton>
            ))}
        </ScrollView>
      </GestureDetector>

      {/* Continuous gesture inside continuous native list */}
      <GestureDetector gesture={scrollGesture}>
        <ScrollView style={styles.list}>
          <GestureDetector gesture={nestedPan}>
            <Animated.View style={nestedAnimation} collapsable={false}>
              <Text>Continuous gesture inside continuous native list</Text>
            </Animated.View>
          </GestureDetector>

          {new Array(20)
            .fill(1)
            .map((value, index) => value * index)
            .map((value) => (
              // Discrete gesture inside continuous native list
              <RectButton
                key={value}
                onPress={() => console.log('discrete gesture')}
                style={styles.element}>
                <Text>
                  Discrete gesture inside continuous native list no. {value}
                </Text>
              </RectButton>
            ))}
        </ScrollView>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    gap: 20,
  },
  externalContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 50,
  },
  box: {
    backgroundColor: 'tomato',
    height: 100,
  },
  list: {
    width: 250,
    backgroundColor: 'plum',
  },
  element: {
    margin: 1,
    height: 40,
    backgroundColor: 'orange',
  },
  horizontalList: {
    height: 180,
  },
  horizontalElement: {
    margin: 1,
    width: 80,
    backgroundColor: 'orange',
  },
  listColumns: {
    flexDirection: 'row',
  },
});
