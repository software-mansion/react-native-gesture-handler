import React from 'react';
import {
  Pressable as LegacyPressable,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import {
  ScrollView,
  Pressable as GesturizedPressable,
} from 'react-native-gesture-handler';

export default function Example() {
  return (
    <ScrollView>
      <Text style={styles.text}>Gesturized Nested Pressables</Text>
      <GesturizedBoxes />
      <Text style={styles.text}>Legacy Nested Pressables</Text>
      <LegacyBoxes />
    </ScrollView>
  );
}

const innerStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> =>
  pressed
    ? { backgroundColor: 'purple', width: 100, height: 100 }
    : { width: 100, height: 100, borderWidth: 1 };
const middleStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> =>
  pressed
    ? { backgroundColor: 'green', width: 200, height: 200 }
    : { width: 200, height: 200, borderWidth: 1 };
const outerStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> =>
  pressed
    ? { backgroundColor: 'yellow', width: 300, height: 300 }
    : { width: 300, height: 300, borderWidth: 1 };

function GesturizedBoxes() {
  return (
    <GesturizedPressable style={outerStyle}>
      <GesturizedPressable style={middleStyle}>
        <GesturizedPressable style={innerStyle} />
      </GesturizedPressable>
    </GesturizedPressable>
  );
}

function LegacyBoxes() {
  return (
    <LegacyPressable style={outerStyle}>
      <LegacyPressable style={middleStyle}>
        <LegacyPressable style={innerStyle} />
      </LegacyPressable>
    </LegacyPressable>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 20, margin: 20 },
});
