import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  PressableProps as RNPressableProps,
} from 'react-native';
import {
  OldPressable,
  Pressable as GesturizedPressable,
  PressableProps as GHPressableProps,
} from 'react-native-gesture-handler';

const TestingBase = (props: GHPressableProps & RNPressableProps) => (
  <>
    <GesturizedPressable {...props}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>Gesturized pressable!</Text>
      </View>
    </GesturizedPressable>
    <OldPressable {...props}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>Old pressable!</Text>
      </View>
    </OldPressable>
    <Pressable {...props}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>Legacy pressable!</Text>
      </View>
    </Pressable>
  </>
);

const BACKGROUND_COLOR = '#F5FCFF';

export default TestingBase;
export { BACKGROUND_COLOR };

const styles = StyleSheet.create({
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: BACKGROUND_COLOR,
    textAlign: 'center',
  },
});
