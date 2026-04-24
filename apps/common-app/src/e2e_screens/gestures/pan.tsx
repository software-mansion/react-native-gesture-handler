import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, usePanGesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import GestureBox from "../components/GestureBox";
import { WRONG_BOX_COLOR } from "../components/gestureColors";

export default function PanScreen() {
  const [testID, setTestID] = useState("pan-idle");
  const activatePan = () => setTestID("pan-activated");
  const panGesture = usePanGesture({
    onActivate: () => {
      "worklet";
      scheduleOnRN(activatePan);
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Pan Gesture</Text>
      <View style={styles.content}>
        <GestureBox testID="wrong-element" color={WRONG_BOX_COLOR} />
        <GestureBox gesture={panGesture} testID={testID} />
      </View>

      <Button
        title="Reset"
        onPress={() => setTestID("pan-idle")}
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
