import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import GestureLink from "./components/GestureLink";

const gestureScreens = [
  { key: "tap", title: "Tap", href: "/gestures/tap" as const },
  { key: "pan", title: "Pan", href: "/gestures/pan" as const },
  {
    key: "long-press",
    title: "Long Press",
    href: "/gestures/long-press" as const,
  },
  { key: "rotation", title: "Rotation", href: "/gestures/rotation" as const },
  { key: "pinch", title: "Pinch", href: "/gestures/pinch" as const },
  { key: "fling", title: "Fling", href: "/gestures/fling" as const },
  { key: "hover", title: "Hover", href: "/gestures/hover" as const },
];

export default function Index() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            Gesture Screens
          </Text>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {gestureScreens.map((screen) => (
              <GestureLink
                key={screen.key}
                href={screen.href}
                label={screen.title}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </GestureHandlerRootView>
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
