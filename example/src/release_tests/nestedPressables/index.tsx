import React from 'react';
import {
  Pressable as LegacyPressable,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  ScrollView,
  Pressable as GesturizedPressable,
} from 'react-native-gesture-handler';

export default function Example() {
  return (
    <ScrollView>
      <View style={styles.centering}>
        <Text style={styles.text}>Gesturized Nested Pressables</Text>
        <GesturizedBoxes />
        <Text style={styles.text}>Legacy Nested Pressables</Text>
        <LegacyBoxes />
      </View>
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
  pressed ? { backgroundColor: '#c00' } : { backgroundColor: '#c77' },
  styles.centering,
];
const middleStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  getBoxStyle(BOX_SIZE_COEFFICIENT * 2),
  pressed ? { backgroundColor: '#0c0' } : { backgroundColor: '#7a7' },
  styles.centering,
];
const outerStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  getBoxStyle(BOX_SIZE_COEFFICIENT * 3),
  pressed ? { backgroundColor: '#00c' } : { backgroundColor: '#88a' },
  styles.centering,
];

function GesturizedBoxes() {
  return (
    <GesturizedPressable style={outerStyle} testID="outer">
      <GesturizedPressable style={middleStyle} testID="middle">
        <GesturizedPressable style={innerStyle} testID="inner" />
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
  text: {
    fontSize: 20,
    margin: 20,
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
});
