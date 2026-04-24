import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Button, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, useTapGesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import GestureBox from "../components/GestureBox";
import { WRONG_BOX_COLOR } from "../components/gestureColors";

export default function TapScreen() {
  const navigation = useNavigation<any>();
  const [testID, setTestID] = useState("tap-idle");
  const activateTap = () => setTestID("tap-activated");
  const tapGesture = useTapGesture({
    onActivate: () => {
      "worklet";
      scheduleOnRN(activateTap);
    },
  });
  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title} testID="title">
        Tap Gesture
      </Text>
      <View style={styles.content}>
        <GestureBox gesture={tapGesture} testID={testID} />
        <GestureBox color={WRONG_BOX_COLOR} />
      </View>

      <Button
        title="Reset"
        onPress={() => setTestID("tap-idle")}
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
