import { createStaticNavigation, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Button, StyleSheet, Text, View } from "react-native";

import Fling from "./gestures/fling";
import Hover from "./gestures/hover";
import LongPress from "./gestures/long_press";
import Pan from "./gestures/pan";
import Pinch from "./gestures/pinch";
import Rotation from "./gestures/rotation";
import Tap from "./gestures/tap";

function MainScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gesture Screens</Text>
      <View style={styles.list}>
        <Button
          title="Tap"
          testID="nav-tap"
          onPress={() => navigation.navigate("Tap")}
        />
        <Button
          title="Pan"
          testID="nav-pan"
          onPress={() => navigation.navigate("Pan")}
        />
        <Button
          title="Pinch"
          testID="nav-pinch"
          onPress={() => navigation.navigate("Pinch")}
        />
        <Button
          title="Rotation"
          testID="nav-rotation"
          onPress={() => navigation.navigate("Rotation")}
        />
        <Button
          title="Long Press"
          testID="nav-long-press"
          onPress={() => navigation.navigate("Long Press")}
        />
        <Button
          title="Fling"
          testID="nav-fling"
          onPress={() => navigation.navigate("Fling")}
        />
        <Button
          title="Hover"
          testID="nav-hover"
          onPress={() => navigation.navigate("Hover")}
        />
      </View>
    </View>
  );
}

const linking = {
  prefixes: ["e2eApp://"],
  screens: {
    Main: "",
    Tap: "gestures/tap",
    Pinch: "gestures/pinch",
    Rotation: "gestures/rotation",
    Hover: "gestures/hover",
    "Long Press": "gestures/long-press",
    Pan: "gestures/pan",
    Fling: "gestures/fling",
  },
};

const RootStack = createNativeStackNavigator({
  screens: {
    Main: {
      screen: MainScreen,
    },
    Tap: {
      screen: Tap,
    },
    Pinch: {
      screen: Pinch,
    },
    Rotation: {
      screen: Rotation,
    },
    Hover: {
      screen: Hover,
    },
    "Long Press": {
      screen: LongPress,
    },
    Pan: {
      screen: Pan,
    },
    Fling: {
      screen: Fling,
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function Index() {
  return <Navigation linking={linking} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    textAlign: "center",
  },
  list: {
    gap: 10,
  },
});