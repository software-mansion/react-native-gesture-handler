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
