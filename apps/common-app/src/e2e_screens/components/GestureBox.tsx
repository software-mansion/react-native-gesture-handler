import {
    FlingGesture,
    GestureDetector,
    HoverGesture,
    LongPressGesture,
    PanGesture,
    PinchGesture,
    RotationGesture,
    TapGesture,
} from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { RIGHT_BOX_COLOR } from "./gestureColors";

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
  gesture?: AnyGesture;
  testID?: string;
  color?: string;
};

export default function GestureBox({
  size = 120,
  gesture,
  testID,
  color = RIGHT_BOX_COLOR,
}: GestureBoxProps) {
  const box = (
    <Animated.View
      testID={testID}
      style={[
        styles.box,
        { width: size, height: size, backgroundColor: color },
      ]}
    ></Animated.View>
  );

  if (!gesture) {
    return box;
  }

  return <GestureDetector gesture={gesture as any}>{box}</GestureDetector>;
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 20,
  },
});
