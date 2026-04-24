import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, useRotationGesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import GestureBox from "../components/GestureBox";
import { WRONG_BOX_COLOR } from "../components/gestureColors";

export default function RotationScreen() {
  const [testID, setTestID] = useState("rotation-idle");
  const activateRotation = () => setTestID("rotation-activated");
  const rotationGesture = useRotationGesture({
    onActivate: () => {
      "worklet";
      scheduleOnRN(activateRotation);
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Rotation Gesture</Text>
      <View style={styles.content}>
        <GestureBox testID="wrong-element" color={WRONG_BOX_COLOR} />
        <GestureBox gesture={rotationGesture} testID={testID} />
      </View>

      <Button
        title="Reset"
        onPress={() => setTestID("rotation-idle")}
        testID="reset"
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
});
