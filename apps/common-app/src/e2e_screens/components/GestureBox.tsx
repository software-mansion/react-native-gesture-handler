import { StyleSheet } from 'react-native';
import type {
  FlingGesture,
  HoverGesture,
  LongPressGesture,
  PanGesture,
  PinchGesture,
  RotationGesture,
  TapGesture,
} from 'react-native-gesture-handler';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { RIGHT_BOX_COLOR } from './gestureColors';

export type AnyGesture =
  | TapGesture
  | PanGesture
  | PinchGesture
  | RotationGesture
  | LongPressGesture
  | FlingGesture
  | HoverGesture;

type GestureBoxProps = {
  size?: number;
  gesture: any;
  testID?: string;
  color?: string;
};

export default function GestureBox({
  size = 120,
  gesture,
  testID,
  color = RIGHT_BOX_COLOR,
}: GestureBoxProps) {
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        testID={testID}
        style={[
          styles.box,
          { width: size, height: size, backgroundColor: color },
        ]}></Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 20,
  },
});
