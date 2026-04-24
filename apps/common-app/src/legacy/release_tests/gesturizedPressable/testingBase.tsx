import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
} from 'react-native';
import {
  LegacyPressable as GHPressable,
  LegacyPressableProps as GHPressableProps,
} from 'react-native-gesture-handler';

const TestingBase = (props: GHPressableProps & RNPressableProps) => (
  <>
    <GHPressable {...props}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>RNGH pressable!</Text>
      </View>
    </GHPressable>
    <RNPressable {...props}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>RN pressable!</Text>
      </View>
    </RNPressable>
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
