import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export default function EmptyExample() {
  const panActive = useSharedValue(false);
  const position = useSharedValue(0);
  const panPreviousPosition = useSharedValue(0);
  const scrollPreviousPosition = useSharedValue(-1);

  const scroll = Gesture.Native()
    .onTouchesMove((event) => {
      ('worklet');
      if (!panActive.value) {
        return;
      }

      const scrollPosition = event.allTouches[0].absoluteY;

      if (scrollPreviousPosition.value === -1) {
        scrollPreviousPosition.value = scrollPosition;
        return;
      }

      const delta = scrollPosition - scrollPreviousPosition.value;
      scrollPreviousPosition.value = scrollPosition;

      position.value = position.value - delta;

      // console.log('delta', delta);
      // console.log('position', position.value);
    })
    .onFinalize(() => {
      scrollPreviousPosition.value = -1;
    });

  const pan = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      panActive.value = true;
      position.value = 0;
    })
    .onUpdate((e) => {
      const delta = e.translationY - panPreviousPosition.value;

      position.value += delta;

      panPreviousPosition.value = e.translationY;
    })
    .onFinalize(() => {
      position.value = withSpring(0);
      panActive.value = false;
      panPreviousPosition.value = 0;
      scrollPreviousPosition.value = -1;
    });

  const elementPadding = 21;
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
        translateY: position.value ?? 0,
      },
    ],
  }));

  return (
    <GestureDetector gesture={scroll}>
      <ScrollView style={styles.container}>
        {elementFiller}
        <GestureDetector gesture={pan}>
          <Animated.View style={animation}>
            <Text>Hello World!</Text>
          </Animated.View>
        </GestureDetector>
        {elementFiller}
      </ScrollView>
    </GestureDetector>
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
