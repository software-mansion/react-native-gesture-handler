import { COLORS } from '../../../common';
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function MinimalCard() {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  let offsetX = 0;
  let offsetY = 0;

  const panGesture = usePanGesture({
    onActivate: () => {
      'worklet';
      Animated.spring(scale, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    },
    onUpdate: (e) => {
      'worklet';
      translateX.setValue(e.translationX + offsetX);
      translateY.setValue(e.translationY + offsetY);

      const rotationValue = ((e.translationX + offsetX) / width) * 20;
      rotation.setValue(rotationValue);
    },
    onDeactivate: (e) => {
      'worklet';
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      if (Math.abs(e.translationX + offsetX) > width * 0.3) {
        const direction = e.translationX + offsetX > 0 ? 1 : -1;

        Animated.timing(translateX, {
          toValue: direction * width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          translateX.setValue(0);
          translateY.setValue(0);
          rotation.setValue(0);
          offsetX = 0;
          offsetY = 0;
        });
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();

        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();

        Animated.spring(rotation, {
          toValue: 0,
          useNativeDriver: true,
        }).start();

        offsetX = 0;
        offsetY = 0;
      }
    },
    disableReanimated: true,
  });

  const rotateZ = rotation.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX },
                { translateY },
                { scale },
                { rotateZ },
              ],
            },
          ]}>
          <Text style={styles.text}>Drag me</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 280,
    height: 380,
    backgroundColor: COLORS.PURPLE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '500',
  },
});
