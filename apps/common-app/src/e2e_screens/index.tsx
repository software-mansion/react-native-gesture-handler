import {  StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Fling from "./gestures/fling";
import Tap from "./gestures/tap";
import Pinch from "./gestures/pinch";
import Rotation from "./gestures/rotation";
import Hover from "./gestures/hover";
import LongPress from "./gestures/long_press";
import Pan from "./gestures/pan";
import { createStaticNavigation } from "@react-navigation/native";

const RootStack = createNativeStackNavigator({
  screens: {
    Tap: {
      screen: Tap
    },
    Pinch: {
      screen: Pinch
    },
    Rotation: {
      screen: Rotation
    },
    Hover: {
      screen: Hover
    },
    "Long Press": {
      screen: LongPress
    },
    Pan: {
      screen: Pan
    },
    Fling: {
      screen: Fling
    }
  }
});

const Navigation = createStaticNavigation(RootStack);

export default function Index() {
  return (
    <Navigation/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 24,
    width: "100%",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  title: {
    marginBottom: 12,
    fontWeight: "600",
    fontSize: 20,
    textAlign: "center",
  },
  scrollContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
