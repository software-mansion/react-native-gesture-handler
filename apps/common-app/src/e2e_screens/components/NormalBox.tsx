import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { RIGHT_BOX_COLOR } from './gestureColors';

type GestureBoxProps = {
  size?: number;
  testID?: string;
  color?: string;
};

export default function GestureBox({
  size = 120,
  testID,
  color = RIGHT_BOX_COLOR,
}: GestureBoxProps) {
  return (
    <Animated.View
      testID={testID}
      style={[
        styles.box,
        { width: size, height: size, backgroundColor: color },
      ]}></Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 20,
  },
});
