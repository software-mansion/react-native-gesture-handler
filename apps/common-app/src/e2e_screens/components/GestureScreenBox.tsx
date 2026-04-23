import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import GestureBox, { AnyGesture } from "./GestureBox";

type GestureScreenBoxProps = {
    title: string;
    gesture: AnyGesture;
    testID: string;
    nextLabel?: string;
};

export default function GestureScreenBox({
    title,
    gesture,
    testID,
    nextLabel = "Next",
}: GestureScreenBoxProps) {
    return (
        <GestureHandlerRootView style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.content}>
                <GestureBox gesture={gesture} testID={testID} />
            </View>
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
