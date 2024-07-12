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

const BOX_SIZE_COEFFICIENT = 100;

const getBoxStyle = (size: number): StyleProp<ViewStyle> => ({
  width: size,
  height: size,
  borderWidth: 1,
});

const innerStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  getBoxStyle(BOX_SIZE_COEFFICIENT),
  pressed ? { backgroundColor: 'purple' } : null,
];
const middleStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  getBoxStyle(BOX_SIZE_COEFFICIENT * 2),
  pressed ? { backgroundColor: 'green' } : null,
];
const outerStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  getBoxStyle(BOX_SIZE_COEFFICIENT * 3),
  pressed ? { backgroundColor: 'yellow' } : null,
];

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
