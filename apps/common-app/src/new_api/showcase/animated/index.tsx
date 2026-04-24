import { COLORS, commonStyles } from '../../../common';
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function MinimalCard() {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const colorProgress = useRef(new Animated.Value(0)).current;
  const normalisedRotation = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  let offsetX = 0;
  let offsetY = 0;

  const panGesture = usePanGesture({
    onActivate: () => {
      Animated.spring(scale, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    },
    onUpdate: (e) => {
      translateX.setValue(e.translationX + offsetX);
      translateY.setValue(e.translationY + offsetY);
      const rotationValue = ((e.translationX + offsetX) / width) * 20;
      rotation.setValue(rotationValue);
      normalisedRotation.setValue(
        rotationValue < 0 ? rotationValue - 1 : rotationValue + 1
      );
    },
    onDeactivate: (e) => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      if (Math.abs(e.translationX + offsetX) > width * 0.3) {
        const direction = e.translationX + offsetX > 0 ? 1 : -1;

        Animated.parallel([
          Animated.timing(translateX, {
            toValue: direction * width * 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          translateX.setValue(0);
          translateY.setValue(0);
          rotation.setValue(0);
          normalisedRotation.setValue(1);

          Animated.parallel([
            Animated.spring(scale, {
              toValue: 1,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();

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
      }

      offsetX = 0;
      offsetY = 0;
    },
    onFinalize: (e) => {
      const normalisedRotationValue = e.absoluteX < 0 ? -1 : 1;
      Animated.timing(normalisedRotation, {
        toValue: normalisedRotationValue,
        duration: 500,
        useNativeDriver: true,
      }).start();
      Animated.timing(colorProgress, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    },
    disableReanimated: true,
  });

  const rotateZ = rotation.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const finalBackgroundColor = normalisedRotation.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: [COLORS.RED, COLORS.NAVY, COLORS.GREEN],
    extrapolate: 'clamp',
  });

  return (
    <View style={commonStyles.centerView}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: finalBackgroundColor,
              opacity,
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
  card: {
    width: 280,
    height: 380,
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
