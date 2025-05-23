import React from 'react';
import { CameraView, useCameraPermissions, CameraViewProps } from 'expo-camera';
import { Button, StyleSheet, Text, View } from 'react-native';
import Animated, {
  AnimateProps,
  useAnimatedProps,
} from 'react-native-reanimated';

const AnimatedCameraView = Animated.createAnimatedComponent(CameraView);

interface CameraProps extends Omit<CameraViewProps, 'zoom'> {
  ref?: React.RefObject<
    React.Component<AnimateProps<CameraViewProps>, any, any>
  >;
  zoom: Animated.SharedValue<number>;
}

const Camera = ({ ref, ...props }: CameraProps) => {
  const [permission, requestPermission] = useCameraPermissions();

  const animatedProps = useAnimatedProps(() => {
    return {
      zoom: props.zoom.value - 1,
    };
  });

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <AnimatedCameraView
        ref={ref}
        style={styles.camera}
        facing={props.facing}
        animatedProps={animatedProps}
      />
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
});
