import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export default function EmptyExample() {
  const position = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .activateAfterLongPress(250)
    .onUpdate((e) => {
      position.value = {
        x: e.translationX,
        y: e.translationY,
      };
    })
    .onFinalize(() => {
      position.value = {
        x: withSpring(0),
        y: withSpring(0),
      };
    });
  const elementPadding = 7;
  const elementFiller = (
    <>
      {new Array(elementPadding).fill(1).map(() => (
        <View style={styles.box} key={Math.random()}>
          <Text>Hello World!</Text>
        </View>
      ))}
    </>
  );

  const animation = useAnimatedStyle(() => ({
    ...styles.highlight,
    transform: [
      {
        translateX: position.value.x ?? 0,
      },
      {
        translateY: position.value.y ?? 0,
      },
    ],
  }));

  console.log('rendering');

  return (
    <ScrollView style={styles.container}>
      {elementFiller}
      <GestureDetector gesture={gesture}>
        <Animated.View style={animation}>
          <Text>Hello World!</Text>
        </Animated.View>
      </GestureDetector>
      {elementFiller}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  box: {
    padding: 40,
    backgroundColor: 'navy',
    justifyContent: 'center',
  },
  highlight: {
    padding: 40,
    backgroundColor: 'tomato',
    color: 'white',
    zIndex: 99,
  },
});
