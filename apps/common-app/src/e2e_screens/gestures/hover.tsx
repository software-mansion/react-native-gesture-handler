import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Button, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, useHoverGesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import GestureBox from "../components/GestureBox";
import { WRONG_BOX_COLOR } from "../components/gestureColors";

export default function HoverScreen() {
  const navigation = useNavigation<any>();
  const [testID, setTestID] = useState("hover-idle");
  const activateHover = () => setTestID("hover-activated");
  const hoverGesture = useHoverGesture({
    onActivate: () => {
      "worklet";
      scheduleOnRN(activateHover);
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Hover Gesture</Text>
      <View style={styles.content}>
        <GestureBox testID="wrong-element" color={WRONG_BOX_COLOR} />
        <GestureBox gesture={hoverGesture} testID={testID} />
      </View>

      <Button
        title="Reset"
        onPress={() => setTestID("hover-idle")}
        testID="reset"
      />
      <Button
        title="Back to main"
        onPress={() => navigation.navigate("Main")}
        testID="back-to-main"
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
